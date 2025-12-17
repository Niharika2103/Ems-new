import express from "express";
import {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  toggleLeaveTypeStatus
} from "../controllers/leavePolicy.controller.js";

const router = express.Router();

router.get("/settings/getleave-types", getLeaveTypes);
router.post("/settings/leave-types", createLeaveType);
router.put("/settings/leave-types/:id", updateLeaveType);
router.patch("/settings/leave-types/:id/status", toggleLeaveTypeStatus);

export default router;
