import express from "express";
import {
  getDepartments,
  generateCustomReport,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/departments", getDepartments);
router.post("/custom", generateCustomReport);

export default router;
