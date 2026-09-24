import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from "../services/order.service.js";

export const create = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await createOrder(
      userId,
      req.body.items
    );

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
  console.error("Create order error:", error);

  const statusCode =
    error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      error.statusCode
        ? error.message
        : "Failed to create order",
  });
}
};

export const getMine = async (req, res) => {
  try {
    // ---------------------------------------------------------
    // PARSE PAGINATION
    // ---------------------------------------------------------

    const page =
      req.query.page === undefined
        ? 1
        : Number(req.query.page);

    const limit =
      req.query.limit === undefined
        ? 10
        : Number(req.query.limit);

    // ---------------------------------------------------------
    // STRICT PAGINATION VALIDATION
    // ---------------------------------------------------------

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Page must be a positive integer",
      });
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Limit must be an integer between 1 and 100",
      });
    }

    // ---------------------------------------------------------
    // GET USER ORDERS
    // ---------------------------------------------------------

    const result = await getUserOrders(
      req.user.id,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    const statusCode =
      error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Internal server error"
          : error.message,
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await getOrderById(
      orderId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
  console.error("Get order error:", error);

  const statusCode =
    error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      error.statusCode
        ? error.message
        : "Failed to fetch order",
  });
}
};

export const cancel = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await cancelOrder(
      orderId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
  console.error("Cancel order error:", error);

  const statusCode =
    error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      error.statusCode
        ? error.message
        : "Failed to cancel order",
  });
}
};