import express from "express";
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
  deleteTemplate
} from "../controllers/whatsappTemplate.controller.js";

const router = express.Router();

/* GET */
router.get("/template/fetch", getAllTemplates);

/* CREATE */
router.post("/template", createTemplate);

/* UPDATE */
router.put("/template/:id", updateTemplate);

/* ACTIVATE / DEACTIVATE */
router.patch("/template/:id/status", updateTemplateStatus);

/* DELETE */
router.delete("/template/:id", deleteTemplate);

export default router;
