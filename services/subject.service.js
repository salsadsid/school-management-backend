import Subject from "../models/Subject.js";

// Get all subjects
export const getAllSubjects = async () => {
  return await Subject.find();
};

// Create a new subject
export const createSubject = async (subjectData) => {
  const subject = new Subject(subjectData);
  return await subject.save();
};

// Update a subject
export const updateSubject = async (subjectId, updateData) => {
  return await Subject.findByIdAndUpdate(subjectId, updateData, { new: true });
};

// Delete a subject
export const deleteSubject = async (subjectId) => {
  return await Subject.findByIdAndDelete(subjectId);
};
