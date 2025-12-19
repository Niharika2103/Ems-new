import express from "express";
import upload from "../utils/multer.js";
import {
  uploadFreelancerDocs,
  saveGoogleForm,
  getGoogleForm,
  syncFreelancerSheet,
  listFreelancers,
  approveFreelancer,
  rejectFreelancer,
  // getFreelancerDocs,
  
  generateFreelancerLetter,
  getFreelancerLetters,
  downloadFreelancerLetter,
  deleteFreelancerLetter,
  sendFreelancerLetterEmail
} from "../controllers/Freelancer.controller.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "bankPassbook", maxCount: 1 },
  { name: "aadhaarCard", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "gstCertificate", maxCount: 1 },
  { name: "gstReturns", maxCount: 10 },
  { name: "photo", maxCount: 1 },
  { name: "freelancerDocument", maxCount: 1 }, 
]);

// Upload docs
router.post("/upload", uploadFields, uploadFreelancerDocs);

// GOOGLE FORM ROUTES
router.post("/save-form", saveGoogleForm);
router.get("/sync", syncFreelancerSheet);
router.get("/get-form", getGoogleForm);

// LIST / APPROVE / REJECT
router.get("/list", listFreelancers);
router.post("/approve/:id", approveFreelancer);
router.post("/reject/:id", rejectFreelancer);

// MUST BE LAST
// router.get("/:id", getFreelancerDocs);


// ================= LETTER ROUTES =================

// Generate letter
router.post("/letters/generate", generateFreelancerLetter);

// Get freelancer letters
router.get("/letters/:freelancerId", getFreelancerLetters);

// Download freelancer letter
router.get(
  "/letters/download/:freelancerId/:fileName",
  downloadFreelancerLetter
);

// Delete freelancer letter
router.delete(
  "/letters/:freelancerId/:fileName",
  deleteFreelancerLetter
);

// Send letter via email
router.post("/letters/send-email", sendFreelancerLetterEmail);



export default router;
