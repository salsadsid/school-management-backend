import * as teacherService from "../services/teacher.service.js";

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacherService.getAllTeachers();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new teacher
export const createTeacher = async (req, res) => {
  try {
    const teacherData = req.body;
    const newTeacher = await teacherService.createTeacher(teacherData);
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createUserAndTeacher = async (req, res) => {
  try {
    const teacherData = req.body;
    const newTeacher = await teacherService.createUserAndTeacherService(
      teacherData
    );
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update teacher details
export const updateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const updatedTeacher = await teacherService.updateTeacher(
      teacherId,
      req.body
    );
    res.status(200).json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a teacher
export const deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    await teacherService.deleteTeacher(teacherId);
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
