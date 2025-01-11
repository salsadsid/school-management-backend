import dotenv from "dotenv"; // Load environment variables from a .env file
import Moderator from "../models/Moderator.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

dotenv.config();

const config = {
  db: {
    uri:
      process.env.MONGODB_URI || "mongodb://localhost:27017/SchoolManagement",
  },
  port: process.env.PORT || 8080,
  modelMap: {
    Teacher: "Teacher",
    Student: "Student",
    Moderator: "Moderator",
  },
  roleDetailsMap: {
    teacher: "Teacher",
    student: "Student",
    parent: "Parent",
    admin: "Admin",
    moderator: "Moderator",
  },
  modelMap2: {
    Teacher,
    Student,
    Moderator,
  },
};

export default config;
