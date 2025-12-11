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
} from "../controllers/Freelancer.controller.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "bankPassbook", maxCount: 1 },
  { name: "aadhaarCard", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "gstCertificate", maxCount: 1 },
  { name: "gstReturns", maxCount: 10 },
  { name: "photo", maxCount: 1 },
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

export default router;
