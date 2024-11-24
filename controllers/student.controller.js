import { addStudentToClassService } from "../services/class.service.js";
import {
  createNewStudentService,
  getAllStudentsService,
} from "../services/student.service.js";

const createStudent = async (req, res, next) => {
  try {
    const { name, studentId, password, classId } = req.body;
    console.log(name, studentId, password, classId);
    const newStudent = await createNewStudentService({
      name,
      password,
      studentId,
      class: classId,
    });

    await addStudentToClassService(newStudent._id, classId);

    res.status(201).json(newStudent);
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

export default { createStudent, getAllStudents };
