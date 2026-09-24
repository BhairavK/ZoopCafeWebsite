import express from "express";

import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  getAdminMenuItems,
  getAdminMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,

  createVariant,
  updateVariant,
  deleteVariant,

  updateItemAvailability,
  updateVariantAvailability,
} from "../controllers/admin.menu.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);


/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

router.get("/categories", getAdminCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);


/*
|--------------------------------------------------------------------------
| MENU ITEMS
|--------------------------------------------------------------------------
*/

router.get("/items", getAdminMenuItems);
router.get("/items/:id", getAdminMenuItemById);

router.post("/items", createMenuItem);
router.patch("/items/:id", updateMenuItem);
router.delete("/items/:id", deleteMenuItem);


/*
|--------------------------------------------------------------------------
| VARIANTS
|--------------------------------------------------------------------------
*/

router.post(
  "/items/:id/variants",
  createVariant
);

router.patch(
  "/variants/:id",
  updateVariant
);

router.delete(
  "/variants/:id",
  deleteVariant
);


/*
|--------------------------------------------------------------------------
| AVAILABILITY
|--------------------------------------------------------------------------
*/

router.patch(
  "/items/:id/availability",
  updateItemAvailability
);

router.patch(
  "/variants/:id/availability",
  updateVariantAvailability
);


export default router;