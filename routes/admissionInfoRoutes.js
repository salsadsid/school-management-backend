import express from "express";
import admissionInfoController from "../controllers/admissionInfo.controller.js";
const router = express.Router();

router.get("/", admissionInfoController.getAllAdmissionInfo);
router.post("/", admissionInfoController.addAdmissionInfo);

export default router;