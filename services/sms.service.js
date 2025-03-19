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
  const formattedTime = moment.tz(time, tz).format("DD MMM YYYY [at] h:mm A");
  return `Student Name: ${name} (ID: ${id}), Today your ${
    type === "entry" ? "" : "late "
  }entry recorded at ${formattedTime}.\nPRINCIPAL\nH.A.K ACADEMY\nJOINA BAZAR, SREEPUR`;
};

const createAbsentMessage = (name, id) =>
  `Student Name: ${name} (ID: ${id}), Your absence noted today.\nPRINCIPAL\nH.A.K ACADEMY\nJOINA BAZAR, SREEPUR`;

const createExitMessage = (name, id, time) => {
  const formattedTime = moment.tz(time, tz).format("DD MMM YYYY [at] h:mm A");
  return `Student Name: ${name} (ID: ${id}),Your exit recorded at ${formattedTime}.\nPRINCIPAL\nH.A.K ACADEMY\nJOINA BAZAR, SREEPUR`;
};

export const fetchTransactions = async () => {
  try {
    const tz = "Asia/Dhaka";
    const now = moment.tz(tz);

    // Calculate time range for current day
    const startTime = now.clone().startOf("day").format("YYYY-MM-DD HH:mm");
    const endTime = now.format("YYYY-MM-DD HH:mm");
    const pageSize = 2000;

    // Fetch from BioTime API
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

    // Validate response
    if (response.data.code !== 0 || !response.data.data) {
      throw new Error(response.data.msg || "Invalid BioTime response");
    }

    // Process transactions with timezone conversion
    const bulkOps = response.data.data.map((transaction) => {
      const punchTime = moment
        .tz(transaction.punch_time, "YYYY-MM-DD HH:mm:ss", tz)
        .toDate();

      return {
        updateOne: {
          filter: { transactionId: transaction.id },
          update: {
            $setOnInsert: {
              transactionId: transaction.id,
              empCode: transaction.emp_code,
              punchTime: punchTime,
              rawData: transaction,
              processed: false,
            },
          },
          upsert: true,
        },
      };
    });

    await BioTimeTransaction.bulkWrite(bulkOps);

    return BioTimeTransaction.find({
      punchTime: {
        $gte: moment.tz(tz).startOf("day").toDate(),
        $lte: now.toDate(),
      },
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
    const message = `Dear ${student.name},ID: ${student.studentId}, attendance recorded at ${transaction.punchTime} in H.A.K Academy.`;
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
    // 1. Fetch students
    // 1. Fetch and store today's transactions automatically
    await fetchTransactions();

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
    if (!students.length)
      return { success: false, message: "No students found" };

    // 2. Time calculations
    const now = moment.tz(tz);
    const todayStart = now.clone().startOf("day").add(1, "minute");
    const todayEnd = now.clone().endOf("day").subtract(1, "minute");
    const entryCutoff = now.clone().set({ hour: 8, minute: 1, second: 0 });
    const exitCutoff = now.clone().set({ hour: 11, minute: 30, second: 0 });
    const lateThreshold = now.clone().set({ hour: 7, minute: 31, second: 0 });

    // 3. Get existing reports
    const existingReports = await SMSReport.find({
      createdAt: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
    });

    // 4. Process students
    const smsBatch = [];
    const failedDetails = [];
    const processedTransactions = [];

    for (const student of students) {
      const { studentId, name, phoneNumber1 } = student;
      const phoneNumber = phoneNumber1?.toString().trim();
      const studentName = name?.toString().trim();

      // Validate contact info
      if (!phoneNumber || !studentName) {
        failedDetails.push({
          studentId: studentId?.toString(),
          reason: "Missing contact info",
        });
        continue;
      }

      // Check existing messages
      const hasEntry = existingReports.some((r) =>
        r.details.some(
          (d) =>
            d.studentId === studentId.toString() &&
            ["entry", "late"].includes(d.type)
        )
      );
      const hasAbsent = existingReports.some((r) =>
        r.details.some(
          (d) => d.studentId === studentId.toString() && d.type === "absent"
        )
      );
      const hasExit = existingReports.some((r) =>
        r.details.some(
          (d) => d.studentId === studentId.toString() && d.type === "exit"
        )
      );

      // Get transactions
      const transactions = await BioTimeTransaction.find({
        empCode: studentId.toString(),
        processed: false,
        punchTime: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() },
      });

      // Process entry/late
      if (!hasEntry) {
        const validEntries = transactions.filter((t) =>
          moment.tz(t.punchTime, tz).isBefore(entryCutoff)
        );

        if (validEntries.length > 0) {
          const earliest = validEntries.reduce((a, b) =>
            moment.tz(a.punchTime, tz).isBefore(moment.tz(b.punchTime, tz))
              ? a
              : b
          );

          const entryType = moment
            .tz(earliest.punchTime, tz)
            .isBefore(lateThreshold)
            ? "entry"
            : "late";

          smsBatch.push({
            number: phoneNumber,
            name: studentName,
            studentId: studentId.toString(),
            message: createEntryMessage(
              studentName,
              studentId,
              earliest.punchTime,
              entryType
            ),
            type: entryType,
          });
          processedTransactions.push(earliest._id);
        } else if (now.isAfter(entryCutoff) && !hasAbsent) {
          smsBatch.push({
            number: phoneNumber,
            name: studentName,
            studentId: studentId.toString(),
            message: createAbsentMessage(studentName, studentId),
            type: "absent",
          });
        }
      }

      // Process exit
      if (!hasExit && now.isAfter(exitCutoff)) {
        const validExits = transactions.filter((t) =>
          moment.tz(t.punchTime, tz).isSameOrAfter(exitCutoff)
        );

        if (validExits.length > 0) {
          const latest = validExits.reduce((a, b) =>
            moment.tz(a.punchTime, tz).isAfter(moment.tz(b.punchTime, tz))
              ? a
              : b
          );

          smsBatch.push({
            number: phoneNumber,
            name: studentName,
            studentId: studentId.toString(),
            message: createExitMessage(
              studentName,
              studentId,
              latest.punchTime
            ),
            type: "exit",
          });
          processedTransactions.push(latest._id);
        }
      }
    }

    // 5. Create SMS report
    const smsReport = new SMSReport({
      date: new Date(),
      total: smsBatch.length + failedDetails.length,
      successCount: smsBatch.length,
      failedCount: failedDetails.length,
      details: smsBatch.map((entry) => ({
        number: entry.number,
        name: entry.name,
        studentId: entry.studentId,
        message: entry.message,
        status: "Success",
        type: entry.type,
      })),
      failedDetails,
    });
    return { smsReport, smsBatch };
  } catch (error) {
    throw new Error(`SMS processing failed: ${error.message}`);
  }
};

export const sendBulkSMS = async () => {
  try {
    // 1. Fetch and store today's transactions automatically
    await fetchTransactions();
    // 1. Fetch students
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
    if (!students.length)
      return { success: false, message: "No students found" };

    // 2. Time calculations
    const now = moment.tz(tz);
    const todayStart = now.clone().startOf("day").add(1, "minute");
    const todayEnd = now.clone().endOf("day").subtract(1, "minute");
    const entryCutoff = now.clone().set({ hour: 8, minute: 1, second: 0 });
    const exitCutoff = now.clone().set({ hour: 11, minute: 30, second: 0 });
    const lateThreshold = now.clone().set({ hour: 7, minute: 31, second: 0 });

    // 3. Get existing reports
    const existingReports = await SMSReport.find({
      createdAt: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
    });

    // 4. Process students
    const smsBatch = [];
    const failedDetails = [];
    const processedTransactions = [];

    for (const student of students) {
      const { studentId, name, phoneNumber1 } = student;
      const phoneNumber = phoneNumber1?.toString().trim();
      const studentName = name?.toString().trim();

      // Validate contact info
      if (!phoneNumber || !studentName) {
        failedDetails.push({
          studentId: studentId?.toString(),
          reason: "Missing contact info",
        });
        continue;
      }

      // Check existing messages
      const hasEntry = existingReports.some((r) =>
        r.details.some(
          (d) =>
            d.studentId === studentId.toString() &&
            ["entry", "late"].includes(d.type)
        )
      );
      const hasAbsent = existingReports.some((r) =>
        r.details.some(
          (d) => d.studentId === studentId.toString() && d.type === "absent"
        )
      );
      const hasExit = existingReports.some((r) =>
        r.details.some(
          (d) => d.studentId === studentId.toString() && d.type === "exit"
        )
      );

      // Get transactions
      const transactions = await BioTimeTransaction.find({
        empCode: studentId.toString(),
        processed: false,
        punchTime: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() },
      });

      // Process entry/late
      if (!hasEntry) {
        const validEntries = transactions.filter((t) =>
          moment.tz(t.punchTime, tz).isBefore(entryCutoff)
        );

        if (validEntries.length > 0) {
          const earliest = validEntries.reduce((a, b) =>
            moment.tz(a.punchTime, tz).isBefore(moment.tz(b.punchTime, tz))
              ? a
              : b
          );

          const entryType = moment
            .tz(earliest.punchTime, tz)
            .isBefore(lateThreshold)
            ? "entry"
            : "late";

          smsBatch.push({
            number: phoneNumber,
            name: studentName,
            studentId: studentId.toString(),
            message: createEntryMessage(
              studentName,
              studentId,
              earliest.punchTime,
              entryType
            ),
            type: entryType,
          });
          processedTransactions.push(earliest._id);
        } else if (now.isAfter(entryCutoff) && !hasAbsent) {
          smsBatch.push({
            number: phoneNumber,
            name: studentName,
            studentId: studentId.toString(),
            message: createAbsentMessage(studentName, studentId),
            type: "absent",
          });
        }
      }

      // Process exit
      if (!hasExit && now.isAfter(exitCutoff)) {
        const validExits = transactions.filter((t) =>
          moment.tz(t.punchTime, tz).isSameOrAfter(exitCutoff)
        );

        if (validExits.length > 0) {
          const latest = validExits.reduce((a, b) =>
            moment.tz(a.punchTime, tz).isAfter(moment.tz(b.punchTime, tz))
              ? a
              : b
          );

          smsBatch.push({
            number: phoneNumber,
            name: studentName,
            studentId: studentId.toString(),
            message: createExitMessage(
              studentName,
              studentId,
              latest.punchTime
            ),
            type: "exit",
          });
          processedTransactions.push(latest._id);
        }
      }
    }

    // 5. Create SMS report
    const smsReport = new SMSReport({
      date: new Date(),
      total: smsBatch.length + failedDetails.length,
      successCount: smsBatch.length,
      failedCount: failedDetails.length,
      details: smsBatch.map((entry) => ({
        number: entry.number,
        name: entry.name,
        studentId: entry.studentId,
        message: entry.message,
        status: "Success",
        type: entry.type,
      })),
      failedDetails,
    });

    // 6. Send SMS
    if (smsBatch.length > 0) {
      try {
        const apiResponse = await sendSMS(smsBatch);
        smsReport.apiResponse = apiResponse;
      } catch (error) {
        smsReport.apiResponse = { error: error.message };
        smsReport.successCount = 0;
        smsReport.failedCount += smsBatch.length;
      }
    }

    await smsReport.save();

    // 7. Update transactions
    if (processedTransactions.length > 0) {
      await BioTimeTransaction.updateMany(
        { _id: { $in: processedTransactions } },
        { $set: { processed: true } }
      );
    }

    return {
      success: true,
      report: smsReport.toObject(),
      message: `Processed ${smsBatch.length} SMS, ${failedDetails.length} failures`,
    };
  } catch (error) {
    console.error("SMS Error:", error);
    return {
      success: false,
      message: `SMS processing failed: ${error.message}`,
    };
  }
};

// Helper methods

const sendSMS = async (smsBatch) => {
  try {
    const smsData = smsBatch.map(({ number, message }) => ({
      MobNumber: `88${number}`,
      Message: message,
    }));
    console.log(smsData);
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

export const sendMultiSMS = async (classIds, message, isTest = true) => {
  try {
    // 1. Get students from target classes
    console.log(classIds);
    const students = await Student.find({ classId: { $in: classIds } });
    console.log(students.length);
    if (students.length === 0) {
      throw new Error("No students found in selected classes");
    }

    // 2. Prepare mobile numbers
    const validStudents = students.filter(
      (s) => s.phoneNumber1?.trim() && s.name?.trim()
    );

    const invalidStudents = students.filter(
      (s) => !s.phoneNumber1?.trim() || !s.name?.trim()
    );

    if (validStudents.length === 0) {
      throw new Error("No students with valid contact information");
    }

    // 3. Prepare API request
    const mobileNumbers = validStudents
      .map((s) => `88${s.phoneNumber1.trim()}`)
      .join(",");
    const apiPayload = {
      UserName: process.env.SMS_USER,
      Apikey: process.env.SMS_API_KEY,
      MobileNumber: mobileNumbers,
      CampaignId: "null",
      SenderName: process.env.SMS_SENDER_NAME,
      TransactionType: "T",
      Message: message,
    };

    // 4. Send SMS
    let apiResponse;
    try {
      const response = await axios.post(
        `${process.env.SMS_API_URL}/api/SmsSending/OneToMany`,
        apiPayload
      );
      apiResponse = response.data;
    } catch (error) {
      apiResponse = {
        error: error.message,
        statusCode: error.response?.status || 500,
      };
      throw error;
    }

    // 5. Create report
    const smsReport = new SMSReport({
      total: students.length,
      successCount: validStudents.length,
      failedCount: invalidStudents.length,
      details: validStudents.map((student) => ({
        number: student.phoneNumber1.trim(),
        name: student.name.trim(),
        studentId: student.studentId,
        message: message,
        status: apiResponse.error ? "Failed" : "Success",
        type: "bulk",
      })),
      failedDetails: invalidStudents.map((student) => ({
        studentId: student.studentId,
        reason: !student.phoneNumber1?.trim()
          ? "Missing phone number"
          : "Missing student name",
      })),
      apiResponse,
      isTest,
    });

    await smsReport.save();
    return smsReport;
  } catch (error) {
    // Create error report

    throw new Error(`Bulk SMS failed: ${error.message}`);
  }
};
