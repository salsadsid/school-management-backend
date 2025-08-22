// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

const configureCloudinary = () => {
  // Check for required environment variables
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Missing Cloudinary environment variables");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Always use HTTPS
  });

  return cloudinary;
};

export default configureCloudinary;
