// models/BioTimeTransaction.js
import mongoose from "mongoose";

const bioTimeTransactionSchema = new mongoose.Schema({
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
  rawData: {
    // Store original API response
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  processed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BioTimeTransaction = mongoose.model(
  "BioTimeTransaction",
  bioTimeTransactionSchema
);

export default BioTimeTransaction;
