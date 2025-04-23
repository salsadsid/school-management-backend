import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import errorHandler from "./middlewares/errorMiddleware.js";
import admissionInfoRoutes from "./routes/admissionInfoRoutes.js";
import admitCardRoutes from "./routes/admitCardRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
console.log(mongoose.modelNames());
app.get("/", (req, res) => {
  res.send("School Management is Running");
});

app.use("/api/v1/uploads/students", express.static("uploads/students"));

app.use("/api/v1", authRoutes);
app.use("/api/v1/class", classRoutes);

app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/teacher", teacherRoutes);

app.use("/api/v1/admission", admissionInfoRoutes);

app.use("/api/v1/section", sectionRoutes);

app.use("/api/v1/attendance", attendanceRoutes);

app.use("/api/v1/sms", smsRoutes);

app.use("/api/v1/admit-card", admitCardRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

export default app;
