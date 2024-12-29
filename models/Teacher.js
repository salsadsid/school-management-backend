import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  subjects: [
    {
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject", // Link to Subject schema
      },
      classes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class", // Link to AcademicClass schema
        },
      ],
    },
  ],
  designation: { type: String, required: true }, // e.g., "Senior Teacher"
  contactNumber: { type: String, required: true },
  address: { type: String }, // Optional field
  joiningDate: { type: Date, default: Date.now },
});

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
