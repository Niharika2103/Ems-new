// src/routes/Freelancer.routes.js
import express from "express";
import upload from "../utils/multer.js";
import {
  uploadFreelancerDocs,
  getFreelancerDocs,
} from "../controllers/Freelancer.controller.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "bankPassbook", maxCount: 1 },
  { name: "aadhaarCard", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "gstCertificate", maxCount: 1 },
  { name: "gstReturns", maxCount: 10 },
  {name:"photo", maxCount: 1},
]);

// Upload documents
router.post("/upload", uploadFields, uploadFreelancerDocs);

// Get existing documents for an employee (optional)
router.get("/:id", getFreelancerDocs);

export default router;
