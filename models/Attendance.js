import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now, // Date of attendance
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // Reference to the associated class
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section", // Reference to the associated section
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Teacher responsible for marking attendance
      required: true,
    },
    attendanceRecords: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student", // Reference to the student
          required: true,
        },
        status: {
          type: String,
          enum: ["present", "absent"], // Attendance status
          required: true,
        },
        remarks: {
          type: String, // Optional remarks for individual students
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
