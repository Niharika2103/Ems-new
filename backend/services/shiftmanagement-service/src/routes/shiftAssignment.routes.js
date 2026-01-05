import express from "express";
import {
  assignShift,
  getAssignmentHistory
} from "../controllers/shiftAssignment.controller.js";

const router = express.Router();

router.post("/", assignShift);
router.get("/history", getAssignmentHistory);

export default router;
