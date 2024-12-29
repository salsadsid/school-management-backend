import express from "express";
import AttendanceController from "../controllers/attendance.controller.js";

const router = express.Router();

// Create new attendance
router.post("/new", AttendanceController.createAttendance);

// Get attendance for a class and section
router.get("/", AttendanceController.getAttendance);

// Update attendance
router.put("/:attendanceId", AttendanceController.updateAttendance);

// Get attendance of a specific student
router.get("/student/:studentId", AttendanceController.getStudentAttendance);

export default router;
