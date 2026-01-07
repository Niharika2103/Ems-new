import express from "express";
import {
  assignShift,
  getAssignmentHistory,
  updateAssignment,
  getCurrentShiftByEmployee
} from "../controllers/shiftAssignment.controller.js";

const router = express.Router();

router.post("/shift-assignments", assignShift);
router.get("/shift-assignments/history", getAssignmentHistory);
router.put("/shift-assignments/:id", updateAssignment);
router.get("/shift-assignments/current/:employeeId", getCurrentShiftByEmployee);

export default router;
