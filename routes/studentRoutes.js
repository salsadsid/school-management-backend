import express from "express";
import studentController from "../controllers/student.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.post("/login", studentController.getStudentById);
router.get("/", tokenVerification, studentController.getAllStudents);
router.post("/new", tokenVerification, studentController.createStudent);

export default router;
