import express from "express";
import authController from "../controllers/auth.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/verify", tokenVerification, authController.verifyToken);

export default router;
