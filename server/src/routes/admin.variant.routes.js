import express from "express";

import {
  getAdminVariants,
} from "../controllers/admin.variant.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/", getAdminVariants);

export default router;