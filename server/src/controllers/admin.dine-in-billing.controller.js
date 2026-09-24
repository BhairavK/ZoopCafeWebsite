import {
  getBillingMenu,
} from "../services/dine-in-billing.service.js";

export const getMenu = async (req, res) => {
  try {
    const menu = await getBillingMenu();

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Get billing menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch billing menu",
    });
  }
};