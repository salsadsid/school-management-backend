import { addStudentToClassService } from "../services/class.service.js";
import {
  createNewStudentandNewUserService,
  getAllStudentsService,
  getStudentByIdService,
} from "../services/student.service.js";

const createStudent = async (req, res, next) => {
  try {
    const { name, studentId, password, classId } = req.body;
    console.log(name, studentId, password, classId);
    const newStudent = await createNewStudentandNewUserService({
      name,
      password,
      studentId,
      class: classId,
    });

    await addStudentToClassService(newStudent._id, classId);

    await res.status(201).json(newStudent);
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const students = await getAllStudentsService();
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const { studentId, password } = req.body;
    console.log(studentId, password);
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
