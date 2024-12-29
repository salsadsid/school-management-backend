import Section from "../models/Section.js";

// Get all sections
export const getAllSections = async () => {
  return await Section.find().populate("teacher class students");
};

// Create a new section
export const createSection = async (sectionData) => {
  const section = new Section(sectionData);
  return await section.save();
};

// Update a section
export const updateSection = async (sectionId, updateData) => {
  return await Section.findByIdAndUpdate(sectionId, updateData, { new: true });
};

// Delete a section
export const deleteSection = async (sectionId) => {
  return await Section.findByIdAndDelete(sectionId);
};

export const addStudentToSectionService = async (studentId, sectionId) => {
  try {
    // console.log(sectionId, studentId);
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
