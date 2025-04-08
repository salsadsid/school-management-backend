import express from "express";
import classController from "../controllers/class.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.get("/:classId", tokenVerification, classController.getClassById);
router.get("/", tokenVerification, classController.getAllClasses);

router.post("/new", tokenVerification, classController.createNewClass);
router.put("/:classId", tokenVerification, classController.updateClass);

export default router;
