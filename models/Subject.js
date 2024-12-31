import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure subject names are not duplicated
  },
  code: {
    type: String,
    required: true,
    unique: true, // Unique identifier for each subject (e.g., "PHY101")
  },
  description: {
    type: String,
  },
  isOptional: {
    type: Boolean,
    default: false, // Mark whether the subject is optional for students
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the admin who created the subject
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
