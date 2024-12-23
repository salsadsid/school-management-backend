import {
  addAdmissionInfoService,
  deleteAnAdmissionInfoService,
  getAllAdmissionInfoService,
  getAnAdmissionInfoService,
  updateAnAdmissionInfoService,
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

const deleteAnAdmissionInfo = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const admissionInfo = await deleteAnAdmissionInfoService(applicationId);
    res.status(200).json(admissionInfo);
  } catch (error) {
    next(error);
  }
};

const updateAnAdmissionInfo = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const admissionInfo = await updateAnAdmissionInfoService(
      applicationId,
      req.body
    );
    res.status(200).json(admissionInfo);
  } catch (error) {
    next(error);
  }
};

export default {
  addAdmissionInfo,
  getAllAdmissionInfo,
  getAnAdmissionInfo,
  deleteAnAdmissionInfo,
  updateAnAdmissionInfo,
};
