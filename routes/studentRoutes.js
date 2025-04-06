import express from "express";
import studentController from "../controllers/student.controller.js";
import dualUpload from "../middlewares/dualUpload.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();
router.get(
  "/phones",
  tokenVerification,
  studentController.getStudentsPhoneNumbers
);
router.post("/login", studentController.getStudentById);
router.get("/:studentId", tokenVerification, studentController.getStudentById);
router.put(
  "/:studentId",
  tokenVerification,
  dualUpload("studentImage"),
  studentController.updateStudent
);
router.delete(
  "/:studentId",
  tokenVerification,
  studentController.deleteStudent
);
router.get("/", tokenVerification, studentController.getAllStudents);
router.post(
  "/new",
  tokenVerification,
  dualUpload("studentImage"),
  studentController.createStudent
);

export default router;
