import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensure uniqueness across class names2
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher", // Class teacher (role: "teacher")
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // List of students in this class
      },
    ],
    // subjects: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Subject", // Subjects taught in this class
    //   },
    // ],
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section", // Sections under this class
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

const Class = mongoose.model("Class", classSchema);

export default Class;
