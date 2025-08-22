const pendingBatchSchema = new mongoose.Schema({
  batchId: { type: String, unique: true },
  smsBatch: [
    {
      number: String,
      name: String,
      studentId: String,
      message: String,
      type: String,
    },
  ],
  failedDetails: [
    {
      studentId: String,
      reason: String,
    },
  ],
  transactionIds: [mongoose.Schema.Types.ObjectId],
  timeData: {
    todayStart: Date,
    todayEnd: Date,
    entryCutoff: Date,
    exitCutoff: Date,
    currentTime: Date,
  },
});

const PendingBatch = mongoose.model("PendingBatch", pendingBatchSchema);

export default PendingBatch;
