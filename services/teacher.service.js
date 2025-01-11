import mongoose from "mongoose";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";

// Get all teachers
export const getAllTeachers = async () => {
  return await Teacher.find()
    .populate("userId")
    .populate("classes")
    .populate("sections");
};

// Create a new teacher
export const createTeacher = async (teacherData) => {
  const teacher = new Teacher(teacherData);
  return await teacher.save();
};

export const createUserAndTeacherService = async (teacherData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Create the User
    const newUser = await User.create(
      [
        {
          name: teacherData.name,
          email: teacherData.email,
          password: teacherData.password,
          role: "teacher",
          roleDetails: "Teacher", // This indicates it's linked to a student
        },
      ],
      { session }
    );

    // Step 2: Create the Student with the user's _id as userId
    const newTeacher = await Teacher.create(
      [
        {
          ...teacherData,
          userId: newUser[0]._id, // Linking the userId
        },
      ],
      { session }
    );

    newUser[0].details = newTeacher[0]._id;
    await newUser[0].save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return { user: newUser[0], teacher: newTeacher[0] };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Error creating user and teacher: ${error.message}`);
  }
};

// Update teacher details
export const updateTeacher = async (teacherId, updateData) => {
  return await Teacher.findByIdAndUpdate(teacherId, updateData, {
    new: true,
  });
};

// Delete a teacher
export const deleteTeacher = async (teacherId) => {
  try {
    // Find the teacher by ID
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return { success: false, message: "Teacher not found" };
    }

    // Delete the teacher record from the Teacher model
    await Teacher.findByIdAndDelete(teacherId);

    // Delete the corresponding user from the User model using `teacher.userId`
    await User.findByIdAndDelete(teacher.userId);

    return {
      success: true,
      message: "Teacher and associated user deleted successfully",
    };
  } catch (error) {
    return { success: false, message: "An error occurred", error };
  }
};
