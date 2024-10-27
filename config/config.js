import dotenv from "dotenv"; // Load environment variables from a .env file

dotenv.config();

const config = {
  db: {
    uri:
      process.env.MONGODB_URI || "mongodb://localhost:27017/SchoolManagement",
  },
  port: process.env.PORT || 8080,
};

export default config;
