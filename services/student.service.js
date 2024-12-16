import Student from "../models/Student.js";
import User from "../models/User.js";

export const createNewStudentandNewUserService = async (studentData) => {
  try {
    console.log(studentData, "studentData");
    const newStudent = await Student.create(studentData);
    const newUser = await User.create({
      ...studentData,
      username: studentData.name.replace(/\s+/g, ""),
      role: "student",
      details: newStudent._id,
      roleDetails: "Student",
    });
    console.log(newUser, "newUser");
    return newStudent;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating student");
  }
};

export const getAllStudentsService = async () => {
  try {
    const students = await Student.find().populate("class");
    return students;
  } catch (error) {
    throw new Error("Error finding students");
  }
};

export const getStudentByIdService = async (studentId) => {
  try {
    const student = await Student.findOne({ studentId });
    return student;
  } catch (error) {
    throw new Error("Error finding student");
  }
};
