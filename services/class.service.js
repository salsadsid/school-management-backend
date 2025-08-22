import mongoose from "mongoose";
import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";

export const getAllClassesService = async () => {
  try {
    const classes = await Class.find()
      .populate({ path: "teacher", select: "-password" })
      .populate({
        path: "students",
        select: "-password",
      });
    return classes;
  } catch (error) {
    throw new Error("Error finding classes");
  }
};
export const createNewClassService = async (classData) => {
  try {
    // Step 1: Create the class
    const newClass = await Class.create(classData);

    // Step 2: Update the Teacher model to add the class
    await Teacher.findByIdAndUpdate(classData.teacher, {
      $push: { classes: newClass._id },
    });

    return newClass;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating class");
  }
};

export const addStudentToClassService = async (studentId, classId) => {
  try {
    await Class.updateOne({ _id: classId }, { $push: { students: studentId } });
    const updatedClass = await Class.findById(classId).populate({
      path: "students",
      select: "-password",
    });
    return updatedClass;
  } catch (error) {
    console.log(error);
    throw new Error("Error adding student to class");
  }
};

export const updateClassService = async (classId, updateData) => {
  try {
    // Check if class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      throw new Error("Class not found");
    }

    // Check for duplicate name if name is being updated
    if (updateData.name) {
      const duplicateClass = await Class.findOne({
        name: updateData.name,
        _id: { $ne: classId }, // Exclude current class from check
      });

      if (duplicateClass) {
        throw new Error("Class name already exists");
      }
    }

    // Validate teacher exists if teacher is being updated
    if (updateData.teacher) {
      const teacherExists = await mongoose.model("Teacher").exists({
        _id: updateData.teacher,
      });
      if (!teacherExists) {
        throw new Error("Teacher not found");
      }
    }

    const updatedClass = await Class.findByIdAndUpdate(classId, updateData, {
      new: true,
      runValidators: true, // Ensure validators are run
    }).populate("teacher students sections");

    if (!updatedClass) {
      throw new Error("Class update failed");
    }

    return updatedClass;
  } catch (error) {
    console.error("Update Class Error:", error);
    throw new Error(error.message || "Error updating class");
  }
};

export const getClassByIdService = async (classId) => {
  try {
    const result = await Class.findById({ _id: classId }).populate({
      path: "teacher",
      select: "-password",
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Error finding class");
  }
};
