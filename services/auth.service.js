import Student from "../models/Student.js";
import User from "../models/User.js";

export const createUser = async (user) => {
  try {
    const createdUser = await User.create(user);
    return createdUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new Error("Error finding user");
  }
};

export const getAllTeachersService = async () => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");
    return teachers;
  } catch (error) {
    throw new Error("Error finding teachers");
  }
};

export const createNewStudentService = async (studentData) => {
  try {
    const newStudent = await Student.create(studentData);
    return newStudent;
  } catch (error) {
    throw new Error("Error creating student");
  }
};
