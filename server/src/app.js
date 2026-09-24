import express from "express";
import cors from "cors";

import prisma from "./config/prisma.js";
import menuRoutes from "./routes/menu.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminReviewRoutes from "./routes/admin-review.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminOrderRoutes from "./routes/admin.order.routes.js";
import adminMenuRoutes from "./routes/admin.menu.routes.js";
import adminComboRoutes from "./routes/admin.combo.routes.js";
import adminVariantRoutes from "./routes/admin.variant.routes.js";
import dineInTableRoutes from "./routes/admin.dine-in-table.routes.js";
import dineInBillingRoutes from "./routes/admin.dine-in-billing.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://zoop-cafe-website.vercel.app",
    ],
  })
);
app.use(express.json());
app.use("/api/reviews", reviewRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/menu", adminMenuRoutes);
app.use("/api/admin/combos", adminComboRoutes);
app.use("/api/admin/variants", adminVariantRoutes);
app.use("/api/admin/billing/tables", dineInTableRoutes);
app.use("/api/admin/billing", dineInBillingRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.get("/", (req, res) => {
    res.json({
        message: "Zoop Cafe API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany();

        res.json(restaurants);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

export default app;