import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from "../services/dine-in-table.service.js";

export const getAllTables = async (req, res) => {
  try {
    const tables = await getTables();

    res.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    console.error("Get tables error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tables",
    });
  }
};

export const create = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    const table = await createTable(Number(tableNumber));

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    console.error("Create table error:", error);

    const status =
      error.message.includes("already exists") ||
      error.message.includes("must be")
        ? 400
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to create table",
    });
  }
};

export const update = async (req, res) => {
  try {
    const tableId = Number(req.params.id);

    if (!Number.isInteger(tableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID",
      });
    }

    const table = await updateTable(tableId, req.body);

    res.json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });
  } catch (error) {
    console.error("Update table error:", error);

    const status =
      error.message === "Table not found"
        ? 404
        : error.message.includes("already exists") ||
          error.message.includes("must be") ||
          error.message.includes("Invalid table status")
        ? 400
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to update table",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const tableId = Number(req.params.id);

    if (!Number.isInteger(tableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID",
      });
    }

    await deleteTable(tableId);

    res.json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.error("Delete table error:", error);

    const status =
      error.message === "Table not found"
        ? 404
        : error.message.includes("open bill")
        ? 400
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to delete table",
    });
  }
};