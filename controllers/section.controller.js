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
  let newSection = null;

  try {
    const sectionData = req.body;

    // Step 1: Create the section
    newSection = await sectionService.createSection(sectionData);

    // Step 2: Update the Class
    await Class.findByIdAndUpdate(sectionData.class, {
      $push: { sections: newSection._id },
    });

    // Step 3: Update the Teacher
    await Teacher.findByIdAndUpdate(sectionData.teacher, {
      $push: { sections: newSection._id },
    });

    res.status(201).json(newSection);
  } catch (error) {
    // Cleanup if section was created but other operations failed
    if (newSection) {
      await sectionService
        .deleteSection(newSection._id)
        .catch((cleanupError) => {
          console.error("Cleanup failed:", cleanupError);
        });
    }

    res.status(400).json({
      message: error.message,
      partialCleanup: !!newSection,
    });
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
