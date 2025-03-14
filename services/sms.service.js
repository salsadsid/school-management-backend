// services/smsService.js
import axios from "axios";
import BioTimeTransaction from "../models/BioTimeTransaction.js";
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

// Modified sendBulkSMS
export const sendBulkSMS = async (transactionIds) => {
  try {
    // 1. Get all unprocessed transactions
    const transactions = await BioTimeTransaction.find({
      transactionId: { $in: transactionIds },
      processed: false,
    });

    if (transactions.length === 0) return false; // No transactions to process

    // 2. Get student mappings
    const students = await Student.find({
      studentId: { $in: transactions.map((t) => t.empCode) },
    });

    // 3. Create SMS batch
    const smsBatch = transactions.map((transaction) => {
      const student = students.find((s) => s.studentId === transaction.empCode);
      return {
        number: student?.phoneNumber1,
        message: `Dear ${student?.name}, attendance at ${transaction.rawData.punch_time}`,
      };
    });

    // 4. Validate all numbers exist
    const invalidEntries = smsBatch.filter((e) => !e.number);
    if (invalidEntries.length > 0) {
      throw new Error(
        `Missing phone numbers for ${invalidEntries.length} students`
      );
    }

    // 5. Send SMS
    await sendSMS(
      smsBatch.map((e) => e.number),
      smsBatch.map((e) => e.message)
    );

    // 6. Mark as processed
    await BioTimeTransaction.updateMany(
      { transactionId: { $in: transactions.map((t) => t.transactionId) } },
      { $set: { processed: true } }
    );

    return true;
  } catch (error) {
    throw error;
  }
};

// Helper function to send SMS
const sendSMS = async (numbers, messages) => {
  try {
    const smsData = numbers.map((number, index) => ({
      MobNumber: number,
      Message: messages[index],
    }));
    console.log(smsData);
    const response = await axios.post(
      process.env.SMS_API_URL + "/api/SmsSending/DSMS",
      {
        UserName: process.env.SMS_USER,
        Apikey: process.env.SMS_API_KEY,
        SenderName: process.env.SMS_SENDER_NAME,
        TransactionType: "D",
        SmsData: smsData,
      }
    );
    console.log(response.data);
    // 2. Validate response
    if (response.data.statusCode !== "200") {
      throw new Error(response.data.msg || "Invalid SMS response");
    }

    return response.data;
  } catch (error) {
    throw new Error(
      `SMS Failed: ${error.response?.data?.message || error.message}`
    );
  }
};

export const sendTestSMS = async (number, message) => {
  return await sendSMS([number], [message]);
};
