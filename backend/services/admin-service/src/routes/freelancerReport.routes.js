import express from "express";
import {
  getDepartments,
  generateCustomReport,
} from "../controllers/freelancerReport.controller.js";

const router = express.Router();

router.get("/freelancer/reports/departments", getDepartments);
router.post("/freelancer/reports/custom", generateCustomReport);

export default router;
