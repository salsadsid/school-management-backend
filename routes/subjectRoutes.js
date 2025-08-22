import express from "express";
import subjectController from "../controllers/subject.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

// router.get("/:subjectId", tokenVerification, subjectController.getAllSubjects);
router.get("/", tokenVerification, subjectController.getAllSubjects);

router.post("/new", tokenVerification, subjectController.createSubject);

export default router;
