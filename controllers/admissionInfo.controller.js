import {
  addAdmissionInfoService,
  getAllAdmissionInfoService,
  getAnAdmissionInfoService,
} from "../services/admissionInfo.service.js";

const addAdmissionInfo = async (req, res, next) => {
  try {
    const addAdmissionInfo = await addAdmissionInfoService(req.body);
    res.status(201).json({ status: "success", results: addAdmissionInfo });
  } catch (error) {
    next(error);
  }
};

const getAllAdmissionInfo = async (req, res, next) => {
  try {
    const admissionInfo = await getAllAdmissionInfoService();
    res.status(200).json(admissionInfo);
  } catch (error) {
    next(error);
  }
};

const getAnAdmissionInfo = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    console.log(applicationId);
    const admissionInfo = await getAnAdmissionInfoService(applicationId);
    res.status(200).json(admissionInfo);
  } catch (error) {
    next(error);
  }
};

export default { addAdmissionInfo, getAllAdmissionInfo, getAnAdmissionInfo };
