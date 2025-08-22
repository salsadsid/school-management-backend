import express from "express";
import { generateAdmitCards } from "../controllers/admitCard.controller.js";

const router = express.Router();

router.get("/generate-admit-cards", generateAdmitCards);

export default router;
