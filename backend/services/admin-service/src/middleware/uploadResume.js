import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build absolute path: src/uploads/resumes
const uploadPath = path.join(__dirname, "..", "uploads", "resumes");

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ================================================
// ✅ Allowed resume types
// ================================================
const allowedMimeTypes = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
];

// ================================================
// 🔒 File Filter
// ================================================
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX allowed."), false);
  }
};

/* ------------------------------------------------------------
   1️⃣ DISK STORAGE → For actual job application submission
-------------------------------------------------------------*/
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

export const uploadResume = multer({
  storage: diskStorage,
  fileFilter
});

/* ------------------------------------------------------------
   2️⃣ MEMORY STORAGE → For AI resume parsing
-------------------------------------------------------------*/
export const uploadResumeBuffer = multer({
  storage: multer.memoryStorage(),
  fileFilter
});
