import mongoose from "mongoose";

const smsReportSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    total: Number,
    successCount: Number,
    failedCount: Number,
    details: [
      {
        number: String,
        name: String,
        studentId: String,
        message: String,
        status: String,
      },
    ],
    failedDetails: [
      {
        studentId: String,
        reason: String,
      },
    ],
    apiResponse: {
      statusCode: String,
      status: String,
      trxnId: String,
      responseResult: String,
    },
  },
  { timestamps: true }
);

const SMSReport = mongoose.model("SMSReport", smsReportSchema);

export default SMSReport;
