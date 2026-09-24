import {
  getOpenBill,
  addItemToBill,
  updateBillItem,
  removeBillItem,
  payBill,
} from "../services/dine-in-bill.service.js";


// =====================================================
// GET BILL
// =====================================================

export const getBill = async (req, res) => {
  try {
    const tableId = Number(req.params.tableId);

    if (!Number.isInteger(tableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID",
      });
    }

    const bill = await getOpenBill(tableId);

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Get dine-in bill error:", error);

    const status =
      error.message === "Table not found"
        ? 404
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to fetch bill",
    });
  }
};


// =====================================================
// ADD ITEM
// =====================================================

export const addItem = async (req, res) => {
  try {
    const tableId = Number(req.params.tableId);

    const menuItemVariantId = Number(
      req.body.menuItemVariantId
    );

    const quantity = Number(req.body.quantity ?? 1);

    if (!Number.isInteger(tableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID",
      });
    }

    const bill = await addItemToBill(
      tableId,
      menuItemVariantId,
      quantity
    );

    res.status(201).json({
      success: true,
      message: "Item added to bill",
      data: bill,
    });
  } catch (error) {
    console.error("Add bill item error:", error);

    const clientErrors = [
      "Invalid table ID",
      "Invalid menu item variant ID",
      "Quantity must be at least 1",
      "Maximum quantity is 100",
      "Table not found",
      "Menu item is unavailable or cannot be used for billing",
    ];

    const status =
      clientErrors.includes(error.message)
        ? 400
        : error.message === "Table not found"
        ? 404
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to add item",
    });
  }
};


// =====================================================
// UPDATE ITEM
// =====================================================

export const updateItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill item ID",
      });
    }

    const item = await updateBillItem(
      itemId,
      quantity
    );

    res.json({
      success: true,
      message: "Bill item updated",
      data: item,
    });
  } catch (error) {
    console.error("Update bill item error:", error);

    const status =
      error.message === "Bill item not found"
        ? 404
        : error.message === "Bill is no longer open"
        ? 400
        : 400;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to update bill item",
    });
  }
};


// =====================================================
// REMOVE ITEM
// =====================================================

export const removeItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill item ID",
      });
    }

    const result = await removeBillItem(itemId);

    res.json({
      success: true,
      message: "Item removed from bill",
      data: result,
    });
  } catch (error) {
    console.error("Remove bill item error:", error);

    const status =
      error.message === "Bill item not found"
        ? 404
        : 400;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to remove bill item",
    });
  }
};


// =====================================================
// PAY BILL
// =====================================================

export const pay = async (req, res) => {
  try {
    const tableId = Number(req.params.tableId);

    if (!Number.isInteger(tableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID",
      });
    }

    const bill = await payBill(tableId);

    res.json({
      success: true,
      message: "Bill paid successfully",
      data: bill,
    });
  } catch (error) {
    console.error("Pay dine-in bill error:", error);

    const status =
      error.message === "Table not found"
        ? 404
        : 400;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to pay bill",
    });
  }
};