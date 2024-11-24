import Student from "../models/Student.js";

export const createNewStudentService = async (studentData) => {
  try {
    console.log(studentData);
    const newStudent = await Student.create(studentData);
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
