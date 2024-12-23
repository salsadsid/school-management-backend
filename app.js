import cors from "cors";
import express from "express";
import errorHandler from "./middlewares/errorMiddleware.js";
import admissionInfoRoutes from "./routes/admissionInfoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("School Management is Running");
});

app.use("/api/v1", authRoutes);
app.use("/api/v1/class", classRoutes);

app.use("/api/v1/student", studentRoutes);

app.use("/api/v1/admission", admissionInfoRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

export default app;
