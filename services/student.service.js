import Student from "../models/Student.js";
import User from "../models/User.js";

import mongoose from "mongoose";

export const createUserAndStudentService = async (studentData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Create the User
    const newUser = await User.create(
      [
        {
          name: studentData.name,
          studentId: studentData.studentId,
          password: studentData.password,
          role: "student",
          roleDetails: "Student", // This indicates it's linked to a student
        },
      ],
      { session }
    );

    // Step 2: Create the Student with the user's _id as userId
    const newStudent = await Student.create(
      [
        {
          ...studentData,
          userId: newUser[0]._id, // Linking the userId
        },
      ],
      { session }
    );

    newUser[0].details = newStudent[0]._id;
    await newUser[0].save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return { user: newUser[0], student: newStudent[0] };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Error creating user and student: ${error.message}`);
  }
};

export const getAllStudentsService = async ({
  classId = null,
  section = null,
}) => {
  try {
    const filter = {};
    if (classId) filter.classId = classId;
    if (section) filter.section = section;

    // Fetch students based on the filter
    const students = await Student.find(filter).populate("classId section");

    return students;
  } catch (error) {
    throw new Error("Error finding students");
  }
};

export const getStudentByIdService = async (studentId) => {
  try {
    console.log(studentId);
    const student = await Student.findOne({ _id: studentId });
    return student;
  } catch (error) {
    throw new Error("Error finding student");
  }
};

export const updateAStudentService = async (studentId, studentData) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: studentId },
      studentData,
      { new: true }
    );
    return student;
  } catch (error) {
    throw new Error("Error updating student");
  }
};

export const deleteStudentService = async (studentId) => {
  try {
    const student = await Student.findOneAndDelete({ _id: studentId });
    return student;
  } catch (error) {
    throw new Error("Error deleting student");
  }
};
