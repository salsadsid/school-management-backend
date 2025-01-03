import express from "express";
import authController from "../controllers/auth.controller.js";
import { tokenVerification } from "../middlewares/tokenVerification.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ status: "ok", message: "School Management is Running" });
});
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/verify", tokenVerification, authController.verifyToken);

export default router;
