import prisma from "../config/prisma.js";

const RESTAURANT_ID = 1;

// =====================================================
// GET OPEN BILL FOR TABLE
// =====================================================

export const getOpenBill = async (tableId) => {
  const table = await prisma.dineInTable.findFirst({
    where: {
      id: tableId,
      restaurantId: RESTAURANT_ID,
    },
    select: {
      id: true,
      tableNumber: true,
      status: true,
    },
  });

  if (!table) {
    throw new Error("Table not found");
  }

  const bill = await prisma.dineInBill.findFirst({
    where: {
      tableId,
      status: "OPEN",
    },
    include: {
      items: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!bill) {
    return {
      id: null,
      tableId: table.id,
      tableNumber: table.tableNumber,
      status: "OPEN",
      totalAmount: 0,
      items: [],
    };
  }

  return {
    id: bill.id,
    tableId: table.id,
    tableNumber: table.tableNumber,
    status: bill.status,
    totalAmount: Number(bill.totalAmount),
    items: bill.items.map((item) => ({
      id: item.id,
      menuItemVariantId: item.menuItemVariantId,
      itemName: item.itemName,
      variantName: item.variantName,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice),
    })),
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
  };
};


// =====================================================
// GET OR CREATE OPEN BILL
// =====================================================

const getOrCreateOpenBill = async (tableId, tx = prisma) => {
  const existingBill = await tx.dineInBill.findFirst({
    where: {
      tableId,
      status: "OPEN",
    },
  });

  if (existingBill) {
    return existingBill;
  }

  const bill = await tx.dineInBill.create({
    data: {
      tableId,
      status: "OPEN",
      totalAmount: 0,
    },
  });

  return bill;
};


// =====================================================
// ADD ITEM TO BILL
// =====================================================

export const addItemToBill = async (
  tableId,
  menuItemVariantId,
  quantity
) => {
  if (!Number.isInteger(tableId) || tableId <= 0) {
    throw new Error("Invalid table ID");
  }

  if (
    !Number.isInteger(menuItemVariantId) ||
    menuItemVariantId <= 0
  ) {
    throw new Error("Invalid menu item variant ID");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be at least 1");
  }

  return prisma.$transaction(async (tx) => {
    // ---------------------------------------------
    // Verify table
    // ---------------------------------------------

    const table = await tx.dineInTable.findFirst({
      where: {
        id: tableId,
        restaurantId: RESTAURANT_ID,
      },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    // ---------------------------------------------
    // Verify menu variant
    // ---------------------------------------------

    const variant = await tx.menuItemVariant.findFirst({
      where: {
        id: menuItemVariantId,
        isAvailable: true,

        menuItem: {
          is: {
            isAvailable: true,

            category: {
              is: {
                restaurantId: RESTAURANT_ID,
                isActive: true,
              },
            },

            OR: [
              {
                type: "COMBO",
              },
              {
                type: "PRODUCT",
                isComboExclusive: false,
              },
            ],
          },
        },
      },

      select: {
        id: true,
        name: true,
        price: true,

        menuItem: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!variant) {
      throw new Error(
        "Menu item is unavailable or cannot be used for billing"
      );
    }

    // ---------------------------------------------
    // Get or create bill
    // ---------------------------------------------

    const bill = await getOrCreateOpenBill(tableId, tx);

    // ---------------------------------------------
    // Check whether same variant already exists
    // ---------------------------------------------

    const existingItem = await tx.dineInBillItem.findFirst({
      where: {
        billId: bill.id,
        menuItemVariantId: variant.id,
      },
    });

    let billItem;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > 100) {
        throw new Error("Maximum quantity is 100");
      }

      billItem = await tx.dineInBillItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,
          totalPrice: variant.price.mul(newQuantity),
        },
      });
    } else {
      billItem = await tx.dineInBillItem.create({
        data: {
          billId: bill.id,
          menuItemVariantId: variant.id,

          itemName: variant.menuItem.name,
          variantName: variant.name,

          unitPrice: variant.price,
          quantity,

          totalPrice: variant.price.mul(quantity),
        },
      });
    }

    // ---------------------------------------------
    // Recalculate bill total
    // ---------------------------------------------

    const aggregate = await tx.dineInBillItem.aggregate({
      where: {
        billId: bill.id,
      },
      _sum: {
        totalPrice: true,
      },
    });

    const totalAmount = aggregate._sum.totalPrice ?? 0;

    const updatedBill = await tx.dineInBill.update({
      where: {
        id: bill.id,
      },
      data: {
        totalAmount,
      },
      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    // ---------------------------------------------
    // Mark table occupied
    // ---------------------------------------------

    if (table.status !== "OCCUPIED") {
      await tx.dineInTable.update({
        where: {
          id: table.id,
        },
        data: {
          status: "OCCUPIED",
        },
      });
    }

    return {
      id: updatedBill.id,
      tableId: table.id,
      tableNumber: table.tableNumber,
      status: updatedBill.status,
      totalAmount: Number(updatedBill.totalAmount),

      items: updatedBill.items.map((item) => ({
        id: item.id,
        menuItemVariantId: item.menuItemVariantId,
        itemName: item.itemName,
        variantName: item.variantName,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        totalPrice: Number(item.totalPrice),
      })),
    };
  });
};


// =====================================================
// UPDATE BILL ITEM QUANTITY
// =====================================================

export const updateBillItem = async (itemId, quantity) => {
  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid bill item ID");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be at least 1");
  }

  if (quantity > 100) {
    throw new Error("Maximum quantity is 100");
  }

  return prisma.$transaction(async (tx) => {
    const item = await tx.dineInBillItem.findUnique({
      where: {
        id: itemId,
      },

      include: {
        bill: {
          include: {
            table: true,
          },
        },
      },
    });

    if (!item) {
      throw new Error("Bill item not found");
    }

    if (item.bill.status !== "OPEN") {
      throw new Error("Bill is no longer open");
    }

    const updatedItem = await tx.dineInBillItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity,
        totalPrice: item.unitPrice.mul(quantity),
      },
    });

    const aggregate = await tx.dineInBillItem.aggregate({
      where: {
        billId: item.billId,
      },
      _sum: {
        totalPrice: true,
      },
    });

    const totalAmount = aggregate._sum.totalPrice ?? 0;

    await tx.dineInBill.update({
      where: {
        id: item.billId,
      },
      data: {
        totalAmount,
      },
    });

    return {
      id: updatedItem.id,
      menuItemVariantId: updatedItem.menuItemVariantId,
      itemName: updatedItem.itemName,
      variantName: updatedItem.variantName,
      unitPrice: Number(updatedItem.unitPrice),
      quantity: updatedItem.quantity,
      totalPrice: Number(updatedItem.totalPrice),
      billTotal: Number(totalAmount),
    };
  });
};


// =====================================================
// REMOVE BILL ITEM
// =====================================================

export const removeBillItem = async (itemId) => {
  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid bill item ID");
  }

  return prisma.$transaction(async (tx) => {
    const item = await tx.dineInBillItem.findUnique({
      where: {
        id: itemId,
      },

      include: {
        bill: true,
      },
    });

    if (!item) {
      throw new Error("Bill item not found");
    }

    if (item.bill.status !== "OPEN") {
      throw new Error("Bill is no longer open");
    }

    await tx.dineInBillItem.delete({
      where: {
        id: itemId,
      },
    });

    const aggregate = await tx.dineInBillItem.aggregate({
      where: {
        billId: item.billId,
      },
      _sum: {
        totalPrice: true,
      },
    });

    const totalAmount = aggregate._sum.totalPrice ?? 0;

    await tx.dineInBill.update({
      where: {
        id: item.billId,
      },
      data: {
        totalAmount,
      },
    });

    // If no items remain, make table available.
    if (Number(totalAmount) === 0) {
      await tx.dineInTable.update({
        where: {
          id: item.bill.tableId,
        },
        data: {
          status: "AVAILABLE",
        },
      });
    }

    return {
      billId: item.billId,
      totalAmount: Number(totalAmount),
    };
  });
};


// =====================================================
// PAY BILL
// =====================================================

export const payBill = async (tableId) => {
  if (!Number.isInteger(tableId) || tableId <= 0) {
    throw new Error("Invalid table ID");
  }

  return prisma.$transaction(async (tx) => {
    const table = await tx.dineInTable.findFirst({
      where: {
        id: tableId,
        restaurantId: RESTAURANT_ID,
      },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    const bill = await tx.dineInBill.findFirst({
      where: {
        tableId,
        status: "OPEN",
      },

      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!bill) {
      throw new Error("No open bill for this table");
    }

    if (bill.items.length === 0) {
      throw new Error("Cannot pay an empty bill");
    }

    const paidBill = await tx.dineInBill.update({
      where: {
        id: bill.id,
      },
      data: {
        status: "PAID",
      },

      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    await tx.dineInTable.update({
      where: {
        id: table.id,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    return {
      id: paidBill.id,
      tableId: table.id,
      tableNumber: table.tableNumber,
      status: paidBill.status,
      totalAmount: Number(paidBill.totalAmount),

      items: paidBill.items.map((item) => ({
        id: item.id,
        menuItemVariantId: item.menuItemVariantId,
        itemName: item.itemName,
        variantName: item.variantName,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        totalPrice: Number(item.totalPrice),
      })),

      paidAt: paidBill.updatedAt,
    };
  });
};