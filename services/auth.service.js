import config from "../config/config.js";
import User from "../models/User.js";

export const createUser = async (user) => {
  try {
    const createdUser = await User.create(user); // Use the session
    return createdUser; // User.create returns an array when using sessions
  } catch (error) {
    console.log(error);
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

export const getUserByEmailAndDetails = async (email) => {
  try {
    const user = await User.findOne({ email }).select("-password");

    if (!user) throw new Error("User not found");

    if (user.details && user.roleDetails in config.modelMap) {
      await user.populate({
        path: "details",
        model: config.modelMap[user.roleDetails],
        select: "-password",
      });
    }

    return user;
  } catch (error) {
    throw new Error("Error finding user: " + error.message);
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
