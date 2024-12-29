import Teacher from "../models/Teacher.js";

// Get all teachers
export const getAllTeachers = async () => {
  return await Teacher.find().populate(
    "userId subjects.subjectId subjects.classes"
  );
};

// Create a new teacher
export const createTeacher = async (teacherData) => {
  const teacher = new Teacher(teacherData);
  return await teacher.save();
};

// Update teacher details
export const updateTeacher = async (teacherId, updateData) => {
  return await Teacher.findByIdAndUpdate(teacherId, updateData, {
    new: true,
  });
};

// Delete a teacher
export const deleteTeacher = async (teacherId) => {
  return await Teacher.findByIdAndDelete(teacherId);
};
