import User from "../models/User.js";

export const createUser = async (user) => {
  try {
    const createdUser = await User.create(user);
    return createdUser;
  } catch (error) {
    // console.log(error);
    throw new Error("Error creating account");
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

export const getUserByStudentId = async (studentId) => {
  try {
    const user = await User.findOne({ studentId });
    return user;
  } catch (error) {
    throw new Error("Error finding user");
  }
};
