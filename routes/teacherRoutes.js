import express from "express";
import * as teacherController from "../controllers/teacher.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.get("/", tokenVerification, teacherController.getAllTeachers);
router.post("/new", tokenVerification, teacherController.createUserAndTeacher);

router.delete("/:id", tokenVerification, teacherController.deleteTeacher);

export default router;
