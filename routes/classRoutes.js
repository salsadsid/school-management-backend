import express from "express";
import classController from "../controllers/class.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.get("/", tokenVerification, classController.getAllClasses);
router.post("/new", tokenVerification, classController.createNewClass);

export default router;
