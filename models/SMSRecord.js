// models/ProcessedTransaction.js
import mongoose from "mongoose";

const smsRecordSchema = new mongoose.Schema({
  statusCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  trxnId: {
    type: Date,
    required: true,
  },
  responseResult: {
    type: String,
  },
});

const SMSRecord = mongoose.model("SentSMSRecord", smsRecordSchema);

export default SMSRecord;
