import { addStudentToClassService } from "../services/class.service.js";
import { addStudentToSectionService } from "../services/section.service.js";
import {
  createUserAndStudentService,
  deleteStudentService,
  getAllStudentsService,
  getStudentByIdService,
  updateAStudentService,
} from "../services/student.service.js";

const createStudent = async (req, res, next) => {
  try {
    const { classId, section } = req.body;
    // console.log(name, studentId, password, classId);
    // console.log(req.body);
    const newStudent = await createUserAndStudentService(req.body);
    // console.log(newStudent);
    const updatedClass = await addStudentToClassService(
      newStudent.student._id,
      classId
    );
    const updatedSection = await addStudentToSectionService(
      newStudent.student._id,
      section
    );

    await res.status(201).json({
      message: "Student created successfully",
      student: newStudent,
      class: updatedClass,
      section: updatedSection,
    });
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const { classId = null, section = null } = req.query;
    const students = await getAllStudentsService({ classId, section });
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const { studentId, password } = req.params;
    // console.log(studentId, password);
    const student = await getStudentByIdService(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // if (!student.matchPassword(password)) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }

    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;
    console.log(studentId, updateData);
    const updatedStudent = await updateAStudentService(studentId, updateData);
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const deletedStudent = await deleteStudentService(studentId);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(deletedStudent);
  } catch (error) {
    next(error);
  }
};

export default {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
