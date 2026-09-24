import express from "express";

import {
  create,
  getMine,
  getOne,
  cancel,
} from "../controllers/order.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER ORDERS
|--------------------------------------------------------------------------
*/

// Create order
router.post(
  "/",
  requireAuth,
  create
);

// My orders
router.get(
  "/",
  requireAuth,
  getMine
);

// One of my orders
router.get(
  "/:id",
  requireAuth,
  getOne
);

// Cancel my order
router.patch(
  "/:id/cancel",
  requireAuth,
  cancel
);

export default router;