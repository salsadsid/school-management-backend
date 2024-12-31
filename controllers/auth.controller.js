import mongoose from "mongoose";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import {
  createUser,
  getAllTeachersService,
  getUserByEmail,
  getUserByStudentId,
} from "../services/auth.service.js";

const signup = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      email,
      password,
      name,
      designation,
      contactNumber,
      address,
      subjects,
    } = req.body;

    // Create the user
    const newUser = await createUser(
      {
        email,
        password,
        role: "teacher",
        name,
      },
      session // Pass session to maintain atomicity
    );

    // Create the teacher profile connected to the user
    const newTeacher = await Teacher.create(
      [
        {
          userId: newUser._id,
          subjects,
          designation,
          contactNumber,
          address,
          name,
          email,
        },
      ],
      { session } // Pass session
    );

    // Update the User with the Teacher ID in the details field
    await User.findByIdAndUpdate(
      newUser._id,
      { details: newTeacher[0]._id }, // Update the details field with Teacher ID
      { session }
    );

    // Commit the transaction if both User and Teacher creation succeeded
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ newUser, newTeacher });
  } catch (error) {
    // Rollback any changes made in the database
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email = " ", password, studentId = "" } = req.body;
  try {
    let user;
    if (studentId) {
      user = await getUserByStudentId(studentId);
    } else {
      user = await getUserByEmail(email);
    }
    // console.log(user);
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    }
    const token = user.getSignedJwtToken();
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    // console.log(req.user);
    const email = req.user.email;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await getAllTeachersService();
    res.status(200).json(teachers);
  } catch (error) {
    next(error);
  }
};

export default { signup, login, verifyToken, getAllTeachers };
