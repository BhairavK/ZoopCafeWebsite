import express from "express";

import {
  getAllReviews,
  updateReviewStatus,
} from "../controllers/admin-review.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/", getAllReviews);
router.patch("/:id/status", updateReviewStatus);

export default router;