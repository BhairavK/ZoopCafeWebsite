import prisma from "../config/prisma.js";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

const ALLOWED_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

class OrderStatusError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
};

export const transitionOrderStatus = async (
  orderId,
  newStatus
) => {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new OrderStatusError(
      "Invalid order status",
      400
    );
  }

  const existingOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingOrder) {
    throw new OrderStatusError(
      "Order not found",
      404
    );
  }

  const allowedStatuses =
    ALLOWED_TRANSITIONS[existingOrder.status];

  if (!allowedStatuses.includes(newStatus)) {
    throw new OrderStatusError(
      `Cannot change order status from ${existingOrder.status} to ${newStatus}`,
      409
    );
  }

  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: existingOrder.status,
    },
    data: {
      status: newStatus,
    },
  });

  if (result.count !== 1) {
    throw new OrderStatusError(
      "Order status changed by another request. Please refresh and try again.",
      409
    );
  }

  const updatedOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      updatedAt: true,
    },
  });

  return {
    ...updatedOrder,
    totalAmount: Number(updatedOrder.totalAmount),
  };
};

export const cancelCustomerOrder = async (
  orderId,
  userId
) => {
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      userId,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    },
    data: {
      status: "CANCELLED",
    },
  });

  if (result.count !== 1) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!order) {
      throw new OrderStatusError(
        "Order not found",
        404
      );
    }

    throw new OrderStatusError(
      `Order cannot be cancelled because its current status is ${order.status}`,
      409
    );
  }

  const updatedOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      updatedAt: true,
    },
  });

  return {
    ...updatedOrder,
    totalAmount: Number(updatedOrder.totalAmount),
  };
};