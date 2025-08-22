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
    type: String,
    required: true,
  },
  responseResult: {
    type: String,
  },
});

const SMSRecord = mongoose.model("SMSRecord", smsRecordSchema);

export default SMSRecord;
