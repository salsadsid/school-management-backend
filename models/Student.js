import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  studentId: {
    type: String,
    required: true,
    unique: true, // Ensure student IDs are unique
  },
  name: {
    type: String,
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // Reference to the AcademicClass model
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section", // Reference to the Section model
    // required: true,
  },
  rollNumber: {
    type: Number,
    required: true,
  },
  phoneNumber1: {
    type: String,
    required: true,
  },
  phoneNumber2: {
    type: String,
  },
  guardians: [
    {
      name: { type: String, required: true },
      relation: { type: String, required: true }, // e.g., "Father", "Mother"
      contactNumber: { type: String, required: true },
      email: { type: String },
      occupation: { type: String },
    },
  ],
  address: {
    type: String,
    // required: true,
  },
  dateOfBirth: {
    type: Date,
    // required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    // required: true,
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  // academicRecords: [
  //   {
  //     year: { type: Number, required: true },
  //     subjects: [
  //       {
  //         subjectId: {
  //           type: mongoose.Schema.Types.ObjectId,
  //           ref: "Subject", // Reference to Subject model
  //         },
  //         marksObtained: { type: Number, default: 0 },
  //       },
  //     ],
  //     totalMarks: { type: Number, default: 0 },
  //     grade: { type: String }, // E.g., "A+", "B"
  //   },
  // ],
  isActive: {
    type: Boolean,
    default: true, // Whether the student is currently enrolled
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound Index to ensure rollNumber is unique within class and section
studentSchema.pre("save", async function (next) {
  const existingStudent = await Student.findOne({
    rollNumber: this.rollNumber,
    classId: this.classId,
    section: this.section,
  });

  if (
    existingStudent &&
    existingStudent._id.toString() !== this._id.toString()
  ) {
    return next(
      new Error("Roll number must be unique within the same class and section.")
    );
  }

  next();
});

// Middleware to update `updatedAt` before save
studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
