import express from "express";
import {
  createShift,
  getShifts,
  updateShift
} from "../controllers/shift.controller.js";

const router = express.Router();

router.post("/shifts/addshift", createShift);
router.get("/shifts", getShifts);
router.put("/shifts/:id", updateShift);

export default router;
