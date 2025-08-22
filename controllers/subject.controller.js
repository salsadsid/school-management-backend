import * as subjectService from "../services/subject.service.js";

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await subjectService.getAllSubjects();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const subjectData = req.body;
    const newSubject = await subjectService.createSubject(subjectData);
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a subject
const updateSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;
    const updatedSubject = await subjectService.updateSubject(
      subjectId,
      req.body
    );
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a subject
const deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;
    await subjectService.deleteSubject(subjectId);
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { createSubject, deleteSubject, getAllSubjects, updateSubject };
