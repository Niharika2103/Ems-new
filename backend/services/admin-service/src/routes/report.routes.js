import express from "express";
import {
  getDepartments,
  generateCustomReport,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/reports/departments", getDepartments);
router.post("/reports/custom", generateCustomReport);

export default router;
