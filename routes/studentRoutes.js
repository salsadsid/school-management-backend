import express from "express";
import studentController from "../controllers/student.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.post("/login", studentController.getStudentById);
router.get("/:studentId", tokenVerification, studentController.getStudentById);
router.put("/:studentId", tokenVerification, studentController.updateStudent);
router.delete(
  "/:studentId",
  tokenVerification,
  studentController.deleteStudent
);
router.get("/", tokenVerification, studentController.getAllStudents);
router.post("/new", tokenVerification, studentController.createStudent);

export default router;
