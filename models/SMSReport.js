import mongoose from "mongoose";

const smsReportSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    total: Number,
    successCount: Number,
    failedCount: Number,
    details: [
      {
        number: { type: String, required: true },
        name: { type: String, required: true },
        studentId: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ["Success", "Failed"], required: true },
        type: {
          type: String,
          enum: ["entry", "late", "absent", "exit"],
          required: true,
        },
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
