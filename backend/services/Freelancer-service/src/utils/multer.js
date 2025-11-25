// src/utils/multer.js
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// base uploads folder (../uploads from src)
const uploadBasePath = path.join(__dirname, "..", "..", "uploads");

// ensure folders exist
const subFolders = ["passbook", "aadhaar", "pan", "gstCertificate", "gstReturns","photo"];
subFolders.forEach((folder) => {
  const fullPath = path.join(uploadBasePath, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderMap = {
      bankPassbook: "passbook",
      aadhaarCard: "aadhaar",
      panCard: "pan",
      gstCertificate: "gstCertificate",
      gstReturns: "gstReturns",
      photo:"photo",
    };

    const subFolder = folderMap[file.fieldname] || "others";
    const destPath = path.join(uploadBasePath, subFolder);
    cb(null, destPath);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
