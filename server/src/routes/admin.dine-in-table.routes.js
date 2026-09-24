import express from "express";

import {
  getAllTables,
  create,
  update,
  remove,
} from "../controllers/admin.dine-in-table.controller.js";

import {requireAuth} from "../middleware/auth.middleware.js";
import {requireAdmin} from "../middleware/admin.middleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAllTables);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;