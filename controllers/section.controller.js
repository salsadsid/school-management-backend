import mongoose from "mongoose";
import Class from "../models/Class.js";
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

    // Create the section and pass the session to maintain atomicity
    const newSection = await sectionService.createSection(sectionData, session);

    // Update the corresponding class with the newly created section ID
    await Class.findByIdAndUpdate(
      sectionData.class, // Assuming `class` is passed in `sectionData`
      { $push: { sections: newSection._id } }, // Push the section ID to the sections array
      { session } // Ensure update happens in the same session
    );

    // Commit the transaction if everything succeeds
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
