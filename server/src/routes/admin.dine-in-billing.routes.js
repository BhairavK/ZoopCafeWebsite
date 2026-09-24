import express from "express";

import {
  getMenu,
} from "../controllers/admin.dine-in-billing.controller.js";

import {
  getBill,
  addItem,
  updateItem,
  removeItem,
  pay,
} from "../controllers/admin.dine-in-bill.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);


// =====================================================
// BILLING MENU
// =====================================================

router.get("/menu", getMenu);


// =====================================================
// TABLE BILL
// =====================================================

// Get current open bill
router.get(
  "/tables/:tableId/bill",
  getBill
);

// Add menu variant to table bill
router.post(
  "/tables/:tableId/items",
  addItem
);

// Pay current table bill
router.post(
  "/tables/:tableId/pay",
  pay
);


// =====================================================
// BILL ITEMS
// =====================================================

// Change quantity
router.patch(
  "/items/:itemId",
  updateItem
);

// Remove item
router.delete(
  "/items/:itemId",
  removeItem
);


export default router;