import Section from "../models/Section.js";

// Get all sections
export const getAllSections = async () => {
  return await Section.find().populate("teacher class students");
};

// Create a new section
export const createSection = async (sectionData) => {
  try {
    const newSection = await Section.create(sectionData);
    return newSection;
  } catch (error) {
    throw new Error(`Section creation failed: ${error.message}`);
  }
};

// Delete a section
export const deleteSection = async (sectionId) => {
  try {
    await Section.findByIdAndDelete(sectionId);
    return true;
  } catch (error) {
    throw new Error(`Section cleanup failed: ${error.message}`);
  }
};
// Update a section
export const updateSection = async (sectionId, updateData) => {
  return await Section.findByIdAndUpdate(sectionId, updateData, { new: true });
};

export const addStudentToSectionService = async (studentId, sectionId) => {
  try {
    // Add student to the section
    await Section.updateOne(
      { _id: sectionId },
      { $push: { students: studentId } }
    );

    // Fetch updated section with populated students
    const updatedSection = await Section.findById(sectionId);

    return updatedSection;
  } catch (error) {
    console.log(error);
    throw new Error("Error adding student to section");
  }
};
