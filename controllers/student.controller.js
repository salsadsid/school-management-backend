import { addStudentToClassService } from "../services/class.service.js";
import { addStudentToSectionService } from "../services/section.service.js";
import {
  createUserAndStudentService,
  getAllStudentsService,
  getStudentByIdService,
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
    const { studentId, password } = req.body;
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

export default { createStudent, getAllStudents, getStudentById };
