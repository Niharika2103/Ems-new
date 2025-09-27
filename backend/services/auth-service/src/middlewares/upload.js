// src/middlewares/upload.js
import multer from "multer";
import path from "path";

// configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

// initialize multer
export const upload = multer({ storage });
