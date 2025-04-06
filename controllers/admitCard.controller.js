import Class from "../models/Class.js";
import Student from "../models/Student.js";
import { generateClassAdmitCards } from "../services/admitCard.service.js";

export const generateAdmitCards = async (req, res) => {
  try {
    const examName = req.query.examName || "Exam - 2025"; // Default exam name if not provided
    const classId = req.query.classId || null; // Default classId if not provided
    if (!examName) {
      return res.status(400).json({
        success: false,
        message: "Exam name is required",
      });
    }

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    const className = await Class.findById(classId);
    // Enhanced validation

    if (!className) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }
    // Enhanced validation
    const students = await Student.find({
      classId: classId,
    }).populate("classId");

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for the provided class ID",
      });
    }
    console.log(className, "className");
    const pdfBuffer = await generateClassAdmitCards(
      students,
      examName,
      className?.name
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=admit-cards-${className?.name}.pdf`
    );
    console.log(Buffer.isBuffer(pdfBuffer)); // should be true
    console.log(pdfBuffer.length); // should be > 0
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      errorType: error.constructor.name,
    });
  }
};
