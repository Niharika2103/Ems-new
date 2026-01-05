import express from "express";
import {
  createShift,
  getShifts,
  updateShift
} from "../controllers/shift.controller.js";

const router = express.Router();

router.post("/", createShift);
router.get("/", getShifts);
router.put("/:id", updateShift);

export default router;
