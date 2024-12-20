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
