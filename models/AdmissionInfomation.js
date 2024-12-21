import mongoose from "mongoose";

const admissionInfomationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
    },
    admissionType: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentNameBangla: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    fatherNameBangla: {
      type: String,
    },
    fatherOccupation: {
      type: String,
    },
    fatherYearlyIncome: {
      type: String,
    },
    fatherContactNo: {
      type: String,
    },
    motherName: {
      type: String,
      required: true,
    },
    motherNameBangla: {
      type: String,
    },
    motherOccupation: {
      type: String,
    },
    motherContactNo: {
      type: String,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
    },
    height: {
      type: String,
    },
    weight: {
      type: String,
    },
    idendificationMark: {
      type: String,
    },
    presentAddress: {
      type: String,
      required: true,
    },
    permanentAddress: {
      type: String,
      required: true,
    },
    emergencyContactNo: {
      type: String,
      required: true,
    },
    relationWithEmergencyContact: {
      type: String,
    },
    previousInstution: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AdmissionInfomation = mongoose.model(
  "AdmissionInfomation",
  admissionInfomationSchema
);

export default AdmissionInfomation;
