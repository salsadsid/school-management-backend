import express from "express";
import * as teacherController from "../controllers/teacher.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.get("/", tokenVerification, teacherController.getAllTeachers);

export default router;
