import express from "express";
import admissionInfoController from "../controllers/admissionInfo.controller.js";
const router = express.Router();

router.get("/:id", admissionInfoController.getAnAdmissionInfo);
router.get("/", admissionInfoController.getAllAdmissionInfo);
router.post("/", admissionInfoController.addAdmissionInfo);
router.delete("/:id", admissionInfoController.deleteAnAdmissionInfo);

export default router;
