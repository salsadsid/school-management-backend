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
  try {
    const sectionData = req.body;
    const newSection = await sectionService.createSection(sectionData);
    res.status(201).json(newSection);
  } catch (error) {
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
