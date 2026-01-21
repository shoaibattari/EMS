import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const upload = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error("Only JPG, JPEG, PNG images allowed"));
    },
  });
};

export default upload;
