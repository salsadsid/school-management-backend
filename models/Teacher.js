import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },

  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // Link to AcademicClass schema
    },
  ],
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section", // Link to Section schema
    },
  ],

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
  designation: { type: String }, // e.g., "Senior Teacher"
  contactNumber: { type: String },
  address: { type: String }, // Optional field
  joiningDate: { type: Date, default: Date.now },
});

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
