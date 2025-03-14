// services/smsService.js
import axios from "axios";
import moment from "moment";
import BioTimeTransaction from "../models/BioTimeTransaction.js";
import SMSReport from "../models/SMSReport.js";
import Student from "../models/Student.js";

// Modified fetchTransactions function
export const fetchTransactions = async (startTime, endTime, pageSize) => {
  try {
    // 1. Fetch from BioTime API
    // console.log(startTime, endTime);
    const response = await axios.get(process.env.BIOTIME_API_URL, {
      params: {
        start_time: startTime,
        end_time: endTime,
        page_size: pageSize,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${process.env.BIOTIME_API_TOKEN}`,
      },
    });

    // 2. Validate response
    if (response.data.code !== 0 || !response.data.data) {
      throw new Error(response.data.msg || "Invalid BioTime response");
    }

    // 3. Store transactions in DB
    const bulkOps = response.data.data.map((transaction) => ({
      updateOne: {
        filter: { transactionId: transaction.id },
        update: {
          $setOnInsert: {
            transactionId: transaction.id,
            empCode: transaction.emp_code,
            punchTime: new Date(transaction.punch_time),
            rawData: transaction,
          },
        },
        upsert: true,
      },
    }));

    await BioTimeTransaction.bulkWrite(bulkOps);

    // 4. Return stored transactions
    return BioTimeTransaction.find({
      punchTime: { $gte: new Date(startTime), $lte: new Date(endTime) },
    });
  } catch (error) {
    throw new Error(`BioTime Error: ${error.message}`);
  }
};

// Modified sendSingleSMS
export const sendSingleSMS = async (transactionId) => {
  try {
    // 1. Get transaction from local DB
    console.log(transactionId);
    const transaction = await BioTimeTransaction.findOne({ transactionId });
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.processed) throw new Error("Already processed");

    // 2. Find student
    const student = await Student.findOne({
      studentId: transaction.empCode.toString(),
    });
    if (!student) throw new Error("Student not found");

    // 3. Create message
    const message = `Dear ${student.name},ID: ${student.studentId}, attendance recorded at ${transaction.rawData.punch_time} in H.A.K Academy.`;
    console.log(message);
    // 4. Send SMS
    await sendSMS([student.phoneNumber1], [message]);

    // 5. Mark as processed
    await BioTimeTransaction.updateOne(
      { transactionId },
      { $set: { processed: true } }
    );

    return true;
  } catch (error) {
    throw error;
  }
};

export const sendBulkSMS = async (transactionIds) => {
  try {
    // 1. Get unprocessed transactions
    const transactions = await BioTimeTransaction.find({
      transactionId: { $in: transactionIds },
      processed: false,
    });

    if (transactions.length === 0)
      return { success: false, message: "No transactions to process" };

    // 2. Get students and create map
    const empCodes = transactions.map((t) => t.empCode);
    const students = await Student.find({ studentId: { $in: empCodes } });
    const studentMap = new Map(students.map((s) => [s.studentId, s]));

    // 3. Prepare SMS batch and track failures
    const smsBatch = [];
    const failedDetails = [];

    for (const transaction of transactions) {
      const student = studentMap.get(transaction.empCode);

      // Validate student and required fields
      if (!student) {
        failedDetails.push({
          studentId: transaction.empCode,
          reason: "Student not found",
        });
        continue;
      }

      const phoneNumber = student.phoneNumber1?.trim();
      const name = student.name?.trim();
      const studentId = student.studentId?.trim();
      const rawPunchTime = transaction.rawData?.punch_time;

      if (!phoneNumber || !name || !studentId || !rawPunchTime) {
        failedDetails.push({
          studentId: transaction.empCode,
          reason: "Missing required data",
        });
        continue;
      }

      // Format punch time
      const punchTime = moment(rawPunchTime, "YYYY-MM-DD HH:mm:ss").format(
        "DD MMM YYYY, h:mm a"
      );

      smsBatch.push({
        number: `88${phoneNumber}`, // Use the formatted phoneNumber,
        name,
        studentId,
        message: `Dear ${name}, ID: ${studentId}, attendance recorded at ${punchTime} in H.A.K Academy.`,
      });
    }

    // 4. Se  nd SMS and handle response
    let apiResponse = {};
    try {
      if (smsBatch.length > 0) {
        apiResponse = await sendSMS(smsBatch);
      }
    } catch (error) {
      throw new Error(`SMS API Failed: ${error.message}`);
    }

    // 5. Create SMS report
    const smsReport = new SMSReport({
      total: smsBatch.length + failedDetails.length,
      successCount: smsBatch.length,
      failedCount: failedDetails.length,
      details: smsBatch.map((entry) => ({
        ...entry,
        status: "Success",
      })),
      failedDetails,
      apiResponse,
    });

    await smsReport.save();

    // 6. Mark transactions as processed
    await BioTimeTransaction.updateMany(
      { _id: { $in: transactions.map((t) => t._id) } },
      { $set: { processed: true } }
    );

    return smsReport;
  } catch (error) {
    throw error;
  }
};

const sendSMS = async (smsBatch) => {
  try {
    const smsData = smsBatch.map(({ number, message }) => ({
      MobNumber: number,
      Message: message,
    }));
    const response = await axios.post(
      `${process.env.SMS_API_URL}/api/SmsSending/DSMS`,
      {
        UserName: process.env.SMS_USER,
        Apikey: process.env.SMS_API_KEY,
        SenderName: process.env.SMS_SENDER_NAME,
        TransactionType: "D",
        SmsData: smsData,
      }
    );

    console.log(response.data);
    return {
      statusCode: response.data.statusCode,
      status: response.data.status,
      trxnId: response.data.trxnId,
      responseResult: response.data.responseResult,
    };
  } catch (error) {
    throw new Error(
      `SMS Failed: ${error.response?.data?.message || error.message}`
    );
  }
};

export const sendTestSMS = async (number, message) => {
  try {
    const smsBatch = [];
    const failedDetails = [];

    // Validate input
    if (!number?.trim() || !message?.trim()) {
      failedDetails.push({
        reason: "Missing phone number or message",
      });
    } else {
      smsBatch.push({
        number: number.trim(),
        name: "Test User",
        studentId: "TEST-ID",
        message: message.trim(),
      });
    }

    // Send SMS
    let apiResponse = {};
    try {
      if (smsBatch.length > 0) {
        apiResponse = await sendSMS(smsBatch);
      }
    } catch (error) {
      throw new Error(`SMS API Failed: ${error.message}`);
    }

    // Create report
    const smsReport = new SMSReport({
      total: smsBatch.length + failedDetails.length,
      successCount: smsBatch.length,
      failedCount: failedDetails.length,
      details: smsBatch.map((entry) => ({
        ...entry,
        status: "Success",
      })),
      failedDetails,
      apiResponse,
      isTest: true,
    });

    await smsReport.save();
    return smsReport;
  } catch (error) {
    error.report = {
      total: 1,
      successCount: 0,
      failedCount: 1,
      failedDetails: [
        {
          reason: error.message,
        },
      ],
    };
    throw error;
  }
};
