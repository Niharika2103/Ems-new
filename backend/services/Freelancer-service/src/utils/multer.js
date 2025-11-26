// src/utils/multer.js
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Module dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads folder
const uploadBasePath = path.join(__dirname, "..", "..", "uploads");

// Ensure folders exist
const subFolders = ["passbook", "aadhaar", "pan", "gstCertificate", "gstReturns", "photo"];
subFolders.forEach((folder) => {
  const fullPath = path.join(uploadBasePath, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});
//
// Allowed file types
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf"
];

// Max file size (5MB)
const MAX_SIZE = 5 * 1024 * 1024;

// File filter for validation
const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type. Only JPG, PNG & PDF allowed."));
  }
  cb(null, true);
};

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderMap = {
      bankPassbook: "passbook",
      aadhaarCard: "aadhaar",
      panCard: "pan",
      gstCertificate: "gstCertificate",
      gstReturns: "gstReturns",
      photo: "photo",
    };

    const subFolder = folderMap[file.fieldname] || "others";
    const destPath = path.join(uploadBasePath, subFolder);
    cb(null, destPath);
  },

  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Export multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export default upload;
