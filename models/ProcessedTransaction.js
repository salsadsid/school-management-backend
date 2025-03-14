// models/ProcessedTransaction.js
import mongoose from "mongoose";

const processedTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: Number,
    required: true,
    unique: true,
  },
  empCode: {
    type: String,
    required: true,
  },
  punchTime: {
    type: Date,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

const ProcessedTransaction = mongoose.model(
  "ProcessedTransaction",
  processedTransactionSchema
);

export default ProcessedTransaction;
