import express from "express";

import {
  getAvailableComboItems,
  getAllCombos,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo,
} from "../controllers/admin.combo.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/available-items", getAvailableComboItems);
router.get("/", getAllCombos);
router.get("/:id", getComboById);
router.post("/", createCombo);
router.put("/:id", updateCombo);
router.delete("/:id", deleteCombo);

export default router;