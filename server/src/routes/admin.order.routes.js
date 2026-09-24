import express from "express";

import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/admin.order.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// All admin order routes require:
// 1. Valid JWT
// 2. ADMIN role

router.use(requireAuth);
router.use(requireAdmin);

router.get("/", getAllOrders);

router.get("/:id", getOrderById);

router.patch("/:id/status", updateOrderStatus);

export default router;