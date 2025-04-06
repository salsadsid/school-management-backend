// middlewares/dualUpload.js
import configureCloudinary from "../config/cloudinary.js";

// Initialize Cloudinary at the top of your file
import fs from "fs";
import upload from "../config/multer.js";

const cloudinary = configureCloudinary();
const dualUpload = (fieldName) => {
  return async (req, res, next) => {
    // 1. Local upload using Multer
    upload.single(fieldName)(req, res, async (err) => {
      if (err) return next(err);

      if (!req.file) return next();

      try {
        // 2. Cloudinary upload
        const cloudinaryResult = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "student_images",
          }
        );

        // Attach paths to request object
        req.uploadData = {
          localPath: `/uploads/students/${req.file.filename}`,
          cloudinaryUrl: cloudinaryResult.secure_url,
        };

        next();
      } catch (error) {
        // Cleanup local file if Cloudinary upload fails
        fs.unlinkSync(req.file.path);
        next(error);
      }
    });
  };
};

export default dualUpload;
