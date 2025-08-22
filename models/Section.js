import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensure section names are unique (e.g., "A", "B")
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // Reference to the associated class
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Class teacher responsible for this section
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // Students in this section
      },
    ],
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject", // Subjects taught in this section (if specific to the section)
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Section = mongoose.model("Section", sectionSchema);

export default Section;
