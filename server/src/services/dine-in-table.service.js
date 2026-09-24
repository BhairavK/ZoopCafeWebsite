import prisma from "../config/prisma.js";

const RESTAURANT_ID = 1;

export const getTables = async () => {
  return prisma.dineInTable.findMany({
    where: {
      restaurantId: RESTAURANT_ID,
    },
    orderBy: {
      tableNumber: "asc",
    },
    include: {
      bills: {
        where: {
          status: "OPEN",
        },
        select: {
          id: true,
          status: true,
          totalAmount: true,
        },
        take: 1,
      },
    },
  });
};

export const createTable = async (tableNumber) => {
  if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
    throw new Error("Table number must be a positive integer");
  }

  const existing = await prisma.dineInTable.findUnique({
    where: {
      restaurantId_tableNumber: {
        restaurantId: RESTAURANT_ID,
        tableNumber,
      },
    },
  });

  if (existing) {
    throw new Error(`Table ${tableNumber} already exists`);
  }

  return prisma.dineInTable.create({
    data: {
      restaurantId: RESTAURANT_ID,
      tableNumber,
    },
  });
};

export const updateTable = async (tableId, data) => {
  const table = await prisma.dineInTable.findFirst({
    where: {
      id: tableId,
      restaurantId: RESTAURANT_ID,
    },
  });

  if (!table) {
    throw new Error("Table not found");
  }

  const updateData = {};

  if (data.tableNumber !== undefined) {
    if (
      !Number.isInteger(data.tableNumber) ||
      data.tableNumber <= 0
    ) {
      throw new Error("Table number must be a positive integer");
    }

    const duplicate = await prisma.dineInTable.findFirst({
      where: {
        restaurantId: RESTAURANT_ID,
        tableNumber: data.tableNumber,
        NOT: {
          id: tableId,
        },
      },
    });

    if (duplicate) {
      throw new Error(`Table ${data.tableNumber} already exists`);
    }

    updateData.tableNumber = data.tableNumber;
  }

  if (data.status !== undefined) {
    if (!["AVAILABLE", "OCCUPIED"].includes(data.status)) {
      throw new Error("Invalid table status");
    }

    updateData.status = data.status;
  }

  return prisma.dineInTable.update({
    where: {
      id: tableId,
    },
    data: updateData,
  });
};

export const deleteTable = async (tableId) => {
  const table = await prisma.dineInTable.findFirst({
    where: {
      id: tableId,
      restaurantId: RESTAURANT_ID,
    },
    include: {
      bills: {
        where: {
          status: "OPEN",
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!table) {
    throw new Error("Table not found");
  }

  if (table.bills.length > 0) {
    throw new Error(
      "Cannot delete a table with an open bill"
    );
  }

  return prisma.dineInTable.delete({
    where: {
      id: tableId,
    },
  });
};