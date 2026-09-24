import express from "express";

import {
  createReview,
  getRestaurantReviews,
  getMenuItemReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();


// Public
router.get("/restaurant", getRestaurantReviews);
router.get("/item/:menuItemId", getMenuItemReviews);


// Authenticated
router.post("/", authenticate, createReview);
router.get("/me", authenticate, getMyReviews);
router.patch("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);


export default router;