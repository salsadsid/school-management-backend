import mongoose from "mongoose";
import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";
import * as sectionService from "../services/section.service.js";

// Get all sections
export const getAllSections = async (req, res) => {
  try {
    const sections = await sectionService.getAllSections();
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new section
export const createSection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sectionData = req.body;

    // Step 1: Create the section using the service and pass the session
    const newSection = await sectionService.createSection(sectionData, session);

    // Step 2: Update the Class with the new section
    await Class.findByIdAndUpdate(
      sectionData.class,
      { $push: { sections: newSection._id } },
      { session }
    );

    // Step 3: Update the Teacher with the new section
    await Teacher.findByIdAndUpdate(
      sectionData.teacher, // Assuming `teacher` is passed in `sectionData`
      { $push: { sections: newSection._id } },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newSection);
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};
// Update a section
export const updateSection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const updatedSection = await sectionService.updateSection(
      sectionId,
      req.body
    );
    res.status(200).json(updatedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a section
export const deleteSection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    await sectionService.deleteSection(sectionId);
    res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
