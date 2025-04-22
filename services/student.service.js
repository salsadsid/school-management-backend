import Student from "../models/Student.js";
import User from "../models/User.js";

export const createUserAndStudentService = async (studentData) => {
  try {
    // Step 1: Create the User
    const newUser = await User.create({
      name: studentData.name,
      studentId: studentData.studentId,
      password: studentData.password,
      role: "student",
      roleDetails: "Student",
    });

    // Step 2: Create the Student with the user's _id as userId
    const newStudent = await Student.create({
      ...studentData,
      userId: newUser._id,
    });

    // Step 3: Update user with student reference
    newUser.details = newStudent._id;
    await newUser.save();

    return { user: newUser, student: newStudent };
  } catch (error) {
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
    const students = await Student.find(filter).populate("classId");

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
    console.log(studentId, studentData);
    const student = await Student.findOneAndUpdate(
      { _id: studentId },
      studentData,
      { new: true }
    ).populate("classId section");

    if (!student) {
      throw new Error("Student not found");
    }

    console.log(student.classId, "classId");

    return student;
  } catch (error) {
    throw new Error("Error updating student");
  }
};

export const deleteStudentService = async (studentId) => {
  try {
    const student = await Student.findOneAndDelete({ studentId: studentId });
    const user = await User.findOneAndDelete({
      studentId: studentId,
    });
    return student;
  } catch (error) {
    throw new Error("Error deleting student");
  }
};
