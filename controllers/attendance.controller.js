import AttendanceService from "../services/attendance.service.js";

class AttendanceController {
  // Create new attendance
  async createAttendance(req, res) {
    try {
      const { date, classId, section, teacher, attendanceRecords } = req.body;
      const attendance = await AttendanceService.createAttendance({
        date,
        classId,
        section: section,
        teacher: teacher,
        attendanceRecords,
      });

      return res.status(201).json({
        success: true,
        message: "Attendance created successfully.",
        data: attendance,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create attendance.",
        error: error.message,
      });
    }
  }

  // Get attendance for a class and section
  async getAttendance(req, res) {
    try {
      const { classId, section, date } = req.query;

      const attendance = await AttendanceService.getAttendance({
        classId,
        section,
        date,
      });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch attendance.",
        error: error.message,
      });
    }
  }

  // Update attendance
  async updateAttendance(req, res) {
    try {
      const { attendanceId } = req.params;
      const { attendanceRecords } = req.body;

      const updatedAttendance = await AttendanceService.updateAttendance(
        attendanceId,
        attendanceRecords
      );

      if (!updatedAttendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Attendance updated successfully.",
        data: updatedAttendance,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update attendance.",
        error: error.message,
      });
    }
  }

  // Get attendance for a specific student
  async getStudentAttendance(req, res) {
    try {
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;

      const attendance = await AttendanceService.getStudentAttendance(
        studentId,
        {
          startDate,
          endDate,
        }
      );

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "No attendance records found for the student.",
        });
      }

      return res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student attendance.",
        error: error.message,
      });
    }
  }
}

export default new AttendanceController();
