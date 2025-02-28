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
  try {
    // Step 1: Create the User
    const newUser = await User.create({
      name: teacherData.name,
      email: teacherData.email,
      password: teacherData.password,
      role: "teacher",
      roleDetails: "Teacher",
    });

    // Step 2: Create the Teacher with the user's _id as userId
    const newTeacher = await Teacher.create({
      ...teacherData,
      userId: newUser._id, // Direct reference without array index
    });

    // Step 3: Update user with teacher reference
    newUser.details = newTeacher._id;
    await newUser.save();

    return { user: newUser, teacher: newTeacher };
  } catch (error) {
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
