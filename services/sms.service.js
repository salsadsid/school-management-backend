// services/smsService.js
import axios from "axios";
import moment from "moment-timezone";
import BioTimeTransaction from "../models/BioTimeTransaction.js";
import Class from "../models/Class.js";
import SMSReport from "../models/SMSReport.js";
import Student from "../models/Student.js";
const tz = "Asia/Dhaka";
// Modified fetchTransactions function
const createEntryMessage = (name, id, time, type) => {
  const formattedTime = time.format("DD MMM YYYY [at] h:mm A");
  const base = `Student Name: ${name} (ID: ${id}), Today your ${
    type === "entry" ? "" : "late "
  }entry`;
  const body = `${base} has been recorded at H.A.K Academy on ${formattedTime}.`;
  return `${body}\nPRINCIPAL\nH.A.K ACADEMY\nJOINA BAZAR, SREEPUR.`;
};

const createAbsentMessage = (name, id) => {
  const base = `Student Name: ${name} (ID: ${id}), Your absence has been noted today.`;
  return `${base}\nPRINCIPAL\nH.A.K ACADEMY\nJOINA BAZAR, SREEPUR.`;
};

const createExitMessage = (name, id, time) => {
  const formattedTime = moment
    .tz(time, "YYYY-MM-DD HH:mm:ss", tz)
    .format("DD MMM YYYY [at] h:mm A");
  const base = `Student Name: ${name} (ID: ${id}), Today your exit has been recorded`;
  return `${base} at H.A.K Academy on ${formattedTime}.\nPRINCIPAL\nH.A.K ACADEMY\nJOINA BAZAR, SREEPUR.`;
};

const processSMSBatch = async (
  smsBatch,
  failedDetails,
  processedTransactions
) => {
  let apiResponse = {};
  if (smsBatch.length > 0) {
    try {
      apiResponse = await sendSMS(smsBatch);
    } catch (error) {
      throw new Error(`SMS API Failed: ${error.message}`);
    }
  }

  const smsReport = new SMSReport({
    total: smsBatch.length + failedDetails.length,
    successCount: smsBatch.length,
    failedCount: failedDetails.length,
    details: smsBatch.map((entry) => ({
      number: entry.number,
      name: entry.name,
      studentId: entry.studentId,
      message: entry.message,
      status: "Success",
    })),
    failedDetails,
    apiResponse,
  });

  await smsReport.save();
  await BioTimeTransaction.updateMany(
    { _id: { $in: Array.from(processedTransactions) } },
    { $set: { processed: true } }
  );

  return smsReport;
};

export const fetchTransactions = async (startTime, endTime, pageSize) => {
  try {
    // 1. Fetch from BioTime API
    console.log(startTime, endTime);
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
    console.log(response.data.data.length);
    // 3. Store transactions in DB
    const bulkOps = response.data.data.map((transaction) => ({
      updateOne: {
        filter: { transactionId: transaction.id },
        update: {
          $setOnInsert: {
            transactionId: transaction.id,
            empCode: transaction.emp_code,
            punchTime: new Date(
              new Date(transaction.punch_time).getTime() - 7200000
            ),
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

export const previewBulkSMS = async () => {
  try {
    // 1. Get all students from classes FIVE to TEN
    const tz = "Asia/Dhaka"; // Define your timezone explicitly

    // 1. Get all students from target classes
    const classNames = [
      "CLASS FIVE",
      "CLASS SIX",
      "CLASS SEVEN",
      "CLASS EIGHT",
      "CLASS NINE",
      "CLASS TEN",
    ];
    const classes = await Class.find({ name: { $in: classNames } });
    const classIds = classes.map((c) => c._id);
    const students = await Student.find({ classId: { $in: classIds } });

    if (students.length === 0) {
      return { success: false, message: "No students found" };
    }

    // 2. Prepare precise date ranges for today (12:01 AM to 11:59 PM local time)
    const todayStart = moment.tz(tz).startOf("day").add(1, "minute").toDate();
    const todayEnd = moment.tz(tz).endOf("day").subtract(1, "minute").toDate();
    const studentIds = students.map((s) => s.studentId);
    // console.log(todayEnd);
    // 3. Fetch relevant biometric transactions
    const transactions = await BioTimeTransaction.find({
      empCode: { $in: studentIds },
      processed: false,
      punchTime: { $gte: todayStart, $lt: todayEnd },
    });

    // 4. Organize transactions by student
    const transactionsByStudent = new Map();
    transactions.forEach((t) => {
      const entries = transactionsByStudent.get(t.empCode) || [];
      entries.push(t);
      transactionsByStudent.set(t.empCode, entries);
    });

    // 5. Time configuration for message logic
    const currentTime = moment.tz(tz);
    const entryCutoff = moment
      .tz(tz)
      .startOf("day")
      .set({ hour: 8, minute: 1 });
    const exitCutoff = moment
      .tz(tz)
      .startOf("day")
      .set({ hour: 12, minute: 30 });
    const lateThreshold = moment
      .tz(tz)
      .startOf("day")
      .set({ hour: 7, minute: 31 });

    // 6. Process student messages
    const smsBatch = [];
    const failedDetails = [];
    const processedTransactions = new Set();

    for (const student of students) {
      const { studentId, name, phoneNumber1 } = student;
      const phoneNumber = phoneNumber1?.trim();
      const studentName = name?.trim();

      if (!phoneNumber || !studentName) {
        failedDetails.push({ studentId, reason: "Missing contact info" });
        continue;
      }

      // Process entry messages
      const studentTransactions = transactionsByStudent.get(studentId) || [];
      let entryMessageSent = false;

      // Filter and process entry transactions with proper timezone parsing
      const entryTransactions = studentTransactions.filter((t) => {
        const punchTime = moment.tz(
          t.rawData.punch_time,
          "YYYY-MM-DD HH:mm:ss",
          tz
        );
        return punchTime.isBefore(entryCutoff);
      });

      if (entryTransactions.length > 0) {
        const earliestEntry = entryTransactions.reduce((prev, current) => {
          const prevTime = moment.tz(
            prev.rawData.punch_time,
            "YYYY-MM-DD HH:mm:ss",
            tz
          );
          const currTime = moment.tz(
            current.rawData.punch_time,
            "YYYY-MM-DD HH:mm:ss",
            tz
          );
          return prevTime.isBefore(currTime) ? prev : current;
        });

        const entryTime = moment.tz(
          earliestEntry.rawData.punch_time,
          "YYYY-MM-DD HH:mm:ss",
          tz
        );
        const entryType = entryTime.isBefore(lateThreshold) ? "entry" : "late";

        smsBatch.push({
          number: phoneNumber,
          name: studentName,
          studentId,
          message: createEntryMessage(
            studentName,
            studentId,
            entryTime,
            entryType
          ),
          type: entryType,
        });

        entryTransactions.forEach((t) => processedTransactions.add(t._id));
        entryMessageSent = true;
      }

      // Handle absent notifications
      if (!entryMessageSent && currentTime.isAfter(entryCutoff)) {
        smsBatch.push({
          number: phoneNumber,
          name: studentName,
          studentId,
          message: createAbsentMessage(studentName, studentId),
          type: "absent",
        });
      }

      // Process exit messages
      if (currentTime.isAfter(exitCutoff)) {
        const exitTransactions = studentTransactions.filter((t) => {
          const punchTime = moment.tz(
            t.rawData.punch_time,
            "YYYY-MM-DD HH:mm:ss",
            tz
          );
          return punchTime.isSameOrAfter(exitCutoff);
        });

        if (exitTransactions.length > 0) {
          const latestExit = exitTransactions.reduce((prev, current) => {
            const prevTime = moment.tz(
              prev.rawData.punch_time,
              "YYYY-MM-DD HH:mm:ss",
              tz
            );
            const currTime = moment.tz(
              current.rawData.punch_time,
              "YYYY-MM-DD HH:mm:ss",
              tz
            );
            return prevTime.isAfter(currTime) ? prev : current;
          });

          smsBatch.push({
            number: phoneNumber,
            name: studentName,
            studentId,
            message: createExitMessage(
              studentName,
              studentId,
              latestExit.rawData.punch_time
            ),
            type: "exit",
          });

          exitTransactions.forEach((t) => processedTransactions.add(t._id));
        }
      }
    }

    return {
      success: true,
      smsBatch,
      failedDetails,
      processedTransactions,
      timeData: {
        todayStart: todayStart.toISOString(),
        todayEnd: todayEnd.toISOString,
        entryCutoff: entryCutoff.toISOString(),
        exitCutoff: exitCutoff.toISOString(),
        currentTime: currentTime.toISOString(),
      },
    };
  } catch (error) {
    throw new Error("Error fetching transactions");
  }
};

export const sendBulkSMS = async () => {
  try {
    const tz = "Asia/Dhaka"; // Define your timezone explicitly

    // 1. Get all students from target classes
    const classNames = [
      "CLASS FIVE",
      "CLASS SIX",
      "CLASS SEVEN",
      "CLASS EIGHT",
      "CLASS NINE",
      "CLASS TEN",
    ];
    const classes = await Class.find({ name: { $in: classNames } });
    const classIds = classes.map((c) => c._id);
    const students = await Student.find({ classId: { $in: classIds } });

    if (students.length === 0) {
      return { success: false, message: "No students found" };
    }

    // 2. Prepare precise date ranges for today (12:01 AM to 11:59 PM local time)
    const todayStart = moment.tz(tz).startOf("day").add(1, "minute").toDate();
    const todayEnd = moment.tz(tz).endOf("day").subtract(1, "minute").toDate();
    const studentIds = students.map((s) => s.studentId);

    // 3. Fetch relevant biometric transactions
    const transactions = await BioTimeTransaction.find({
      empCode: { $in: studentIds },
      processed: false,
      punchTime: { $gte: todayStart, $lt: todayEnd },
    });

    // 4. Organize transactions by student
    const transactionsByStudent = new Map();
    transactions.forEach((t) => {
      const entries = transactionsByStudent.get(t.empCode) || [];
      entries.push(t);
      transactionsByStudent.set(t.empCode, entries);
    });

    // 5. Time configuration for message logic
    const currentTime = moment.tz(tz);
    const entryCutoff = moment
      .tz(tz)
      .startOf("day")
      .set({ hour: 8, minute: 1 });
    const exitCutoff = moment
      .tz(tz)
      .startOf("day")
      .set({ hour: 12, minute: 30 });
    const lateThreshold = moment
      .tz(tz)
      .startOf("day")
      .set({ hour: 7, minute: 31 });

    // 6. Process student messages
    const smsBatch = [];
    const failedDetails = [];
    const processedTransactions = new Set();

    for (const student of students) {
      const { studentId, name, phoneNumber1 } = student;
      const phoneNumber = phoneNumber1?.trim();
      const studentName = name?.trim();

      if (!phoneNumber || !studentName) {
        failedDetails.push({ studentId, reason: "Missing contact info" });
        continue;
      }

      // Process entry messages
      const studentTransactions = transactionsByStudent.get(studentId) || [];
      let entryMessageSent = false;

      // Filter and process entry transactions with proper timezone parsing
      const entryTransactions = studentTransactions.filter((t) => {
        const punchTime = moment.tz(
          t.rawData.punch_time,
          "YYYY-MM-DD HH:mm:ss",
          tz
        );
        return punchTime.isBefore(entryCutoff);
      });

      if (entryTransactions.length > 0) {
        const earliestEntry = entryTransactions.reduce((prev, current) => {
          const prevTime = moment.tz(
            prev.rawData.punch_time,
            "YYYY-MM-DD HH:mm:ss",
            tz
          );
          const currTime = moment.tz(
            current.rawData.punch_time,
            "YYYY-MM-DD HH:mm:ss",
            tz
          );
          return prevTime.isBefore(currTime) ? prev : current;
        });

        const entryTime = moment.tz(
          earliestEntry.rawData.punch_time,
          "YYYY-MM-DD HH:mm:ss",
          tz
        );
        const entryType = entryTime.isBefore(lateThreshold) ? "entry" : "late";

        smsBatch.push({
          number: phoneNumber,
          name: studentName,
          studentId,
          message: createEntryMessage(
            studentName,
            studentId,
            entryTime,
            entryType
          ),
          type: entryType,
        });

        entryTransactions.forEach((t) => processedTransactions.add(t._id));
        entryMessageSent = true;
      }

      // Handle absent notifications
      if (!entryMessageSent && currentTime.isAfter(entryCutoff)) {
        smsBatch.push({
          number: phoneNumber,
          name: studentName,
          studentId,
          message: createAbsentMessage(studentName, studentId),
          type: "absent",
        });
      }

      // Process exit messages
      if (currentTime.isAfter(exitCutoff)) {
        const exitTransactions = studentTransactions.filter((t) => {
          const punchTime = moment.tz(
            t.rawData.punch_time,
            "YYYY-MM-DD HH:mm:ss",
            tz
          );
          return punchTime.isSameOrAfter(exitCutoff);
        });

        if (exitTransactions.length > 0) {
          const latestExit = exitTransactions.reduce((prev, current) => {
            const prevTime = moment.tz(
              prev.rawData.punch_time,
              "YYYY-MM-DD HH:mm:ss",
              tz
            );
            const currTime = moment.tz(
              current.rawData.punch_time,
              "YYYY-MM-DD HH:mm:ss",
              tz
            );
            return prevTime.isAfter(currTime) ? prev : current;
          });

          smsBatch.push({
            number: phoneNumber,
            name: studentName,
            studentId,
            message: createExitMessage(
              studentName,
              studentId,
              latestExit.rawData.punch_time
            ),
            type: "exit",
          });

          exitTransactions.forEach((t) => processedTransactions.add(t._id));
        }
      }
    }
    console.log(smsBatch.length);
    // 7. Send SMS and update records
    const smsReport = await processSMSBatch(
      smsBatch,
      failedDetails,
      processedTransactions
    );
    return smsReport;
  } catch (error) {
    throw new Error(`SMS processing failed: ${error.message}`);
  }
};

// Helper methods

const sendSMS = async (smsBatch) => {
  try {
    const smsData = smsBatch.map(({ number, message }) => ({
      MobNumber: number,
      Message: message,
    }));
    console.log(smsData.length);
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
