import express from "express";
import * as sectionController from "../controllers/section.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.post("/new", tokenVerification, sectionController.createSection);
router.get("/", tokenVerification, sectionController.getAllSections);

export default router;
