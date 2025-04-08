import configureCloudinary from "../config/cloudinary.js";
import Class from "../models/Class.js";
import biotimeService from "../services/biotime.service.js";
import { addStudentToClassService } from "../services/class.service.js";
import { addStudentToSectionService } from "../services/section.service.js";
import {
  createUserAndStudentService,
  deleteStudentService,
  getAllStudentsService,
  getStudentByIdService,
  updateAStudentService,
} from "../services/student.service.js";

// Initialize Cloudinary at the top of your file
import fs from "fs";

const cloudinary = configureCloudinary();

const createStudent = async (req, res, next) => {
  try {
    const { classId, section } = req.body;
    const studentData = {
      ...req.body,
      imageLocal: req.uploadData?.localPath || "",
      imageCloudinary: req.uploadData?.cloudinaryUrl || "",
    };
    const newStudent = await createUserAndStudentService(studentData);
    // console.log(newStudent);
    const updatedClass = await addStudentToClassService(
      newStudent.student._id,
      classId
    );
    const updatedSection = await addStudentToSectionService(
      newStudent.student._id,
      section
    );

    await res.status(201).json({
      message: "Student created successfully",
      student: newStudent,
      class: updatedClass,
      section: updatedSection,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
      if (req.uploadData?.cloudinaryUrl) {
        await cloudinary.uploader.destroy(
          req.uploadData.cloudinaryUrl.split("/").pop().split(".")[0]
        );
      }
    }
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const { classId = null, section = null } = req.query;
    const students = await getAllStudentsService({ classId, section });
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const { studentId, password } = req.params;
    // console.log(studentId, password);
    const student = await getStudentByIdService(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // if (!student.matchPassword(password)) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }

    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;
    console.log(studentId, updateData);
    const updatedStudent = await updateAStudentService(studentId, updateData);
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const deletedStudent = await deleteStudentService(studentId);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    console.log(deletedStudent, "deletedStudent");
    await Class.updateMany(
      { students: deletedStudent._id },
      { $pull: { students: deletedStudent._id } }
    );

    res.status(200).json({
      message: "Student deleted and removed from class",
      student: deletedStudent,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentsPhoneNumbers = async (req, res, next) => {
  try {
    // Validate input
    const { start_time, end_time } = req.query;
    if (!start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Both start_time and end_time are required",
      });
    }
    console.log("getStudentsPhoneNumbers", start_time);
    // Get phone numbers
    const phoneNumbers = await biotimeService.getPhoneNumbersByTimeRange(
      start_time,
      end_time
    );

    res.json({
      success: true,
      count: phoneNumbers.length,
      data: phoneNumbers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export default {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsPhoneNumbers,
};
