import AdmissionInfomation from "../models/AdmissionInfomation.js";

export const addAdmissionInfoService = async (admissionData) => {
  try {
    const newAdmissionInfo = await AdmissionInfomation.create(admissionData);
    return newAdmissionInfo;
  } catch (error) {
    throw new Error("Error creating admission info");
  }
};

export const getAllAdmissionInfoService = async () => {
  try {
    const admissionInfo = await AdmissionInfomation.find();
    return admissionInfo;
  } catch (error) {
    throw new Error("Error finding admission info");
  }
};

export const getAnAdmissionInfoService = async (id) => {
  try {
    const admissionInfo = await AdmissionInfomation.findOne({
      applicationId: id,
    });
    return admissionInfo;
  } catch (error) {
    throw new Error("Error finding admission info");
  }
};

export const deleteAnAdmissionInfoService = async (id) => {
  try {
    const admissionInfo = await AdmissionInfomation.findOneAndDelete({
      applicationId: id,
    });
    return admissionInfo;
  } catch (error) {
    throw new Error("Error deleting admission info");
  }
};

export const updateAnAdmissionInfoService = async (id, admissionData) => {
  try {
    const admissionInfo = await AdmissionInfomation.findOneAndUpdate(
      { applicationId: id },
      admissionData,
      { new: false }
    );
    return admissionInfo;
  } catch (error) {
    throw new Error("Error updating admission info");
  }
};
