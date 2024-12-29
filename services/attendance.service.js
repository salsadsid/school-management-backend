import Attendance from "../models/Attendance.js";

class AttendanceService {
  // Create new attendance
  async createAttendance(data) {
    // console.log(data, "from service");
    const attendance = new Attendance(data);
    return await attendance.save();
  }

  // Get attendance for a specific class, section, and date
  async getAttendance({ classId, section, date }) {
    try {
      const query = {};
      if (classId) query.classId = classId;
      if (section) query.section = section;
      if (date) {
        // Parse date and match records for the specific day
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }

      const attendanceRecords = await Attendance.find(query)
        .populate("classId", "name") // Populate class details
        .populate("section", "name") // Populate section details
        .populate("attendanceRecords.student", "name rollNumber") // Populate student details
        .exec();

      return attendanceRecords;
    } catch (error) {
      res.status(500).json({ message: "Error fetching attendance", error });
    }
  }

  // Update attendance for a specific record
  async updateAttendance(attendanceId, updatedRecords) {
    return await Attendance.findByIdAndUpdate(
      attendanceId,
      { attendanceRecords: updatedRecords },
      { new: true } // Return the updated document
    ).populate("attendanceRecords.student");
  }

  // Get attendance of a specific student
  async getStudentAttendance(studentId, options = {}) {
    const { startDate, endDate } = options;

    const query = {
      "attendanceRecords.student": studentId,
    };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    return await Attendance.find(query).populate("class section teacher");
  }
}

export default new AttendanceService();
