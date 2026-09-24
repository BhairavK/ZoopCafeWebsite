import express from "express";

import {
  getMenu,
  getMenuItem,
  searchMenu,
  filterMenu,
} from "../controllers/menu.controller.js";

const router = express.Router();

// Full menu
router.get("/", getMenu);

// Search
router.get("/search", searchMenu);

// Filters
router.get("/items", filterMenu);

// Single item
router.get("/items/:id", getMenuItem);

export default router;