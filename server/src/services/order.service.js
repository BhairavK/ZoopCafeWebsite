import prisma from "../config/prisma.js";
import { Prisma } from "../../generated/prisma/client.ts";
import { cancelCustomerOrder } from "./order-status.service.js";

const RESTAURANT_ID = 1;


class OrderError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
|
| Client is trusted only for:
|   - variantId
|   - quantity
|   - combo choice selections
|
| Client is NEVER trusted for:
|   - price
|   - item name
|   - variant name
|   - total price
|   - order status
|   - user ID
|
|--------------------------------------------------------------------------
*/

export const createOrder = async (userId, items) => {
  // ---------------------------------------------------------
  // BASIC REQUEST VALIDATION
  // ---------------------------------------------------------

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user");
  }

  // ---------------------------------------------------------
  // VALIDATE ITEM STRUCTURE
  // ---------------------------------------------------------

  for (const item of items) {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid order item");
    }

    if (
      !Number.isInteger(item.variantId) ||
      item.variantId <= 0
    ) {
      throw new Error("Invalid variant ID");
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error(
        "Quantity must be a positive integer"
      );
    }

    if (item.quantity > 100) {
      throw new Error(
        "Quantity cannot exceed 100"
      );
    }

    if (
      item.choices !== undefined &&
      !Array.isArray(item.choices)
    ) {
      throw new Error(
        "Choices must be an array"
      );
    }
  }

  // ---------------------------------------------------------
  // GET ALL SELECTED VARIANTS
  // ---------------------------------------------------------

  const variantIds = items.map(
    (item) => item.variantId
  );

  const uniqueVariantIds = [
    ...new Set(variantIds),
  ];

  const variants =
    await prisma.menuItemVariant.findMany({
      where: {
        id: {
          in: uniqueVariantIds,
        },
      },

      include: {
        menuItem: {
          include: {
            category: {
              select: {
                id: true,
                restaurantId: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

  // ---------------------------------------------------------
  // CHECK THAT EVERY VARIANT EXISTS
  // ---------------------------------------------------------

  const variantMap = new Map(
    variants.map((variant) => [
      variant.id,
      variant,
    ])
  );

  for (const variantId of uniqueVariantIds) {
    if (!variantMap.has(variantId)) {
      throw new Error(
        `Variant ${variantId} does not exist`
      );
    }
  }

  // ---------------------------------------------------------
  // VALIDATE VARIANTS / MENU ITEMS
  // ---------------------------------------------------------

  for (const variant of variants) {
    const menuItem = variant.menuItem;
    const category = menuItem.category;

    if (!category) {
      throw new Error(
        `${menuItem.name} does not belong to a valid category`
      );
    }

    if (
      category.restaurantId !== RESTAURANT_ID
    ) {
      throw new Error(
        `${menuItem.name} does not belong to this restaurant`
      );
    }

    if (!category.isActive) {
      throw new Error(
        `${menuItem.name} is unavailable`
      );
    }

    if (!menuItem.isAvailable) {
      throw new Error(
        `${menuItem.name} is currently unavailable`
      );
    }

    if (!variant.isAvailable) {
      throw new Error(
        `${menuItem.name} - ${variant.name} is currently unavailable`
      );
    }
  }

  // ---------------------------------------------------------
  // PROCESS EACH ORDER ITEM
  // ---------------------------------------------------------

  const processedItems = [];

  for (const inputItem of items) {
    const variant = variantMap.get(
      inputItem.variantId
    );

    const menuItem = variant.menuItem;

    // =======================================================
    // NORMAL PRODUCT
    // =======================================================

    if (menuItem.type === "PRODUCT") {
      const submittedChoices =
        inputItem.choices ?? [];

      if (submittedChoices.length > 0) {
        throw new Error(
          `${menuItem.name} does not accept choices`
        );
      }

      /*
      | IMPORTANT:
      | Price comes directly from DB.
      */

      const unitPrice = variant.price;

      const totalPrice =
        unitPrice.mul(inputItem.quantity);

      processedItems.push({
        variant,
        quantity: inputItem.quantity,
        unitPrice,
        totalPrice,
        choices: [],
      });

      continue;
    }

    // =======================================================
    // COMBO
    // =======================================================

    if (menuItem.type !== "COMBO") {
      throw new Error(
        `Unsupported menu item type for ${menuItem.name}`
      );
    }

    const submittedChoices =
      inputItem.choices ?? [];

    // -------------------------------------------------------
    // LOAD COMBO CHOICE GROUPS
    // -------------------------------------------------------

    const choiceGroups =
  await prisma.comboChoiceGroup.findMany({
    where: {
      comboId: menuItem.id,
    },

    include: {
      options: {
        include: {
          menuItemVariant: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  isAvailable: true,

                  category: {
                    select: {
                      restaurantId: true,
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          displayOrder: "asc",
        },
      },
    },

    orderBy: {
      displayOrder: "asc",
    },
  });

    // -------------------------------------------------------
    // VALIDATE SUBMITTED CHOICE GROUP STRUCTURE
    // -------------------------------------------------------

    for (const submittedGroup of submittedChoices) {
      if (
        !submittedGroup ||
        typeof submittedGroup !== "object"
      ) {
        throw new Error(
          "Invalid combo choice"
        );
      }

      if (
        !Number.isInteger(
          submittedGroup.choiceGroupId
        )
      ) {
        throw new Error(
          "Invalid choice group ID"
        );
      }

      if (
        !Array.isArray(
          submittedGroup.optionIds
        )
      ) {
        throw new Error(
          "optionIds must be an array"
        );
      }
    }

    // -------------------------------------------------------
    // FIND DUPLICATE SUBMITTED GROUPS
    // -------------------------------------------------------

    const submittedGroupIds =
      submittedChoices.map(
        (choice) => choice.choiceGroupId
      );

    if (
      new Set(submittedGroupIds).size !==
      submittedGroupIds.length
    ) {
      throw new Error(
        `Choice group cannot be submitted more than once for ${menuItem.name}`
      );
    }

    // -------------------------------------------------------
    // VALID GROUP IDS
    // -------------------------------------------------------

    const validGroupIds = new Set(
      choiceGroups.map(
        (group) => group.id
      )
    );

    // -------------------------------------------------------
    // REJECT UNKNOWN GROUPS
    // -------------------------------------------------------

    for (const submittedGroup of submittedChoices) {
      if (
        !validGroupIds.has(
          submittedGroup.choiceGroupId
        )
      ) {
        throw new Error(
          `Invalid choice group ${submittedGroup.choiceGroupId} for ${menuItem.name}`
        );
      }
    }

    // -------------------------------------------------------
    // PROCESS EACH REQUIRED GROUP
    // -------------------------------------------------------

    const processedChoices = [];

    for (const group of choiceGroups) {
      const submittedGroup =
        submittedChoices.find(
          (choice) =>
            choice.choiceGroupId === group.id
        );

      const optionIds =
        submittedGroup?.optionIds ?? [];

      // -----------------------------------------------------
      // VALIDATE OPTION ID TYPES
      // -----------------------------------------------------

      for (const optionId of optionIds) {
        if (
          !Number.isInteger(optionId) ||
          optionId <= 0
        ) {
          throw new Error(
            `Invalid option ID in ${group.name}`
          );
        }
      }

      // -----------------------------------------------------
      // MIN / MAX SELECTION VALIDATION
      // -----------------------------------------------------

      if (
        optionIds.length <
          group.minSelections ||
        optionIds.length >
          group.maxSelections
      ) {
        throw new Error(
          `${group.name} requires between ${group.minSelections} and ${group.maxSelections} selections`
        );
      }

      // -----------------------------------------------------
      // VALID OPTION MAP
      // -----------------------------------------------------

      const optionMap = new Map(
        group.options.map(
          (option) => [
            option.id,
            option,
          ]
        )
      );

      // -----------------------------------------------------
      // VALIDATE EVERY SELECTED OPTION
      // -----------------------------------------------------

      for (const optionId of optionIds) {
        const option =
          optionMap.get(optionId);

        if (!option) {
          throw new Error(
            `Invalid option ${optionId} selected for ${group.name}`
          );
        }

        const selectedVariant =
          option.menuItemVariant;

        if (!selectedVariant) {
          throw new Error(
            `Selected option ${optionId} is invalid`
          );
        }

        // ---------------------------------------------------
        // OPTION MUST BELONG TO THE EXPECTED MENU ITEM
        // ---------------------------------------------------

        if (
          selectedVariant.menuItemId ===
          menuItem.id
        ) {
          throw new Error(
            `Combo ${menuItem.name} cannot select itself as an option`
          );
        }

        // ---------------------------------------------------
        // OPTION AVAILABILITY
        // ---------------------------------------------------

        if (!selectedVariant.isAvailable) {
          throw new Error(
            `${selectedVariant.menuItem.name} - ${selectedVariant.name} is unavailable`
          );
        }

        if (
          !selectedVariant.menuItem.isAvailable ||
          !selectedVariant.menuItem.category ||
          !selectedVariant.menuItem.category.isActive ||
          selectedVariant.menuItem.category.restaurantId !== RESTAURANT_ID
        ) {
          throw new Error(
            `${selectedVariant.menuItem.name} is unavailable`
          );
        }

        // ---------------------------------------------------
        // STORE SNAPSHOT
        // ---------------------------------------------------

        processedChoices.push({
          choiceGroupId: group.id,

          choiceGroupName:
            group.name,

          menuItemVariantId:
            selectedVariant.id,

          optionName:
            selectedVariant.menuItem.name,

          optionVariantName:
            selectedVariant.name,
        });
      }
    }

    // -------------------------------------------------------
    // COMBO PRICE
    // -------------------------------------------------------
    //
    // Choices do NOT add anything to the combo price.
    //
    // Combo price comes from the selected combo variant.
    //

    const unitPrice = variant.price;

    const totalPrice =
      unitPrice.mul(inputItem.quantity);

    processedItems.push({
      variant,
      quantity: inputItem.quantity,
      unitPrice,
      totalPrice,
      choices: processedChoices,
    });
  }

  // ---------------------------------------------------------
  // CREATE ORDER IN ONE TRANSACTION
  // ---------------------------------------------------------

  const order = await prisma.$transaction(
    async (tx) => {
      /*
      | Re-check important availability inside the
      | transaction.
      |
      | This protects against a menu item becoming
      | unavailable between validation and order creation.
      */

      const finalVariantIds = [
        ...new Set(
          processedItems.map(
            (item) => item.variant.id
          )
        ),
      ];

      const currentVariants =
  await tx.menuItemVariant.findMany({
    where: {
      id: {
        in: finalVariantIds,
      },
    },

    include: {
      menuItem: {
        select: {
          id: true,
          name: true,
          type: true,
          isAvailable: true,

          category: {
            select: {
              restaurantId: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

      const currentVariantMap =
        new Map(
          currentVariants.map(
            (variant) => [
              variant.id,
              variant,
            ]
          )
        );

      for (const item of processedItems) {
        const currentVariant =
          currentVariantMap.get(
            item.variant.id
          );

        if (!currentVariant) {
          throw new Error(
            `${item.variant.menuItem.name} is no longer available`
          );
        }

        if (
  !currentVariant.isAvailable ||
  !currentVariant.menuItem.isAvailable ||
  !currentVariant.menuItem.category ||
  !currentVariant.menuItem.category.isActive ||
  currentVariant.menuItem.category.restaurantId !== RESTAURANT_ID
) {
  throw new Error(
    `${currentVariant.menuItem.name} is no longer available`
  );
}

        /*
        | Re-read price.
        |
        | This is important because price is the source
        | of truth in the database.
        */

        item.unitPrice =
          currentVariant.price;

        item.totalPrice =
          currentVariant.price.mul(
            item.quantity
          );
      }

      // -----------------------------------------------------
// RE-CHECK COMBO CHOICES INSIDE TRANSACTION
// -----------------------------------------------------

for (const item of processedItems) {
  if (item.variant.menuItem.type !== "COMBO") {
    continue;
  }

  if (item.choices.length === 0) {
    continue;
  }

  const choiceGroupIds = [
    ...new Set(
      item.choices.map(
        (choice) => choice.choiceGroupId
      )
    ),
  ];

  const currentChoiceGroups =
    await tx.comboChoiceGroup.findMany({
      where: {
        id: {
          in: choiceGroupIds,
        },
        comboId: item.variant.menuItem.id,
      },

      include: {
        options: {
          include: {
            menuItemVariant: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    isAvailable: true,

                    category: {
                      select: {
                        restaurantId: true,
                        isActive: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

  const groupMap = new Map(
    currentChoiceGroups.map(
      (group) => [group.id, group]
    )
  );

  for (const choice of item.choices) {
    const group =
      groupMap.get(choice.choiceGroupId);

    if (!group) {
      throw new Error(
        `Combo choice group "${choice.choiceGroupName}" is no longer available`
      );
    }

    const option = group.options.find(
      (option) =>
        option.menuItemVariantId ===
        choice.menuItemVariantId
    );

    if (!option) {
      throw new Error(
        `${choice.optionName} is no longer an option for ${group.name}`
      );
    }

    const selectedVariant =
      option.menuItemVariant;

    if (!selectedVariant) {
      throw new Error(
        `${choice.optionName} is no longer available`
      );
    }

    if (
      !selectedVariant.isAvailable ||
      !selectedVariant.menuItem.isAvailable ||
      !selectedVariant.menuItem.category ||
      !selectedVariant.menuItem.category.isActive ||
      selectedVariant.menuItem.category.restaurantId !==
        RESTAURANT_ID
    ) {
      throw new Error(
        `${selectedVariant.menuItem.name} - ${selectedVariant.name} is no longer available`
      );
    }
  }
}

      // -----------------------------------------------------
      // CALCULATE FINAL TOTAL
      // -----------------------------------------------------

      let totalAmount = new Prisma.Decimal(0);

      /*
      | Depending on the generated Prisma client version,
      | Prisma.Decimal may not be exposed from the default
      | client object.
      |
      | Therefore use the Decimal constructor from the
      | generated runtime below if necessary.
      */

      for (const item of processedItems) {
        totalAmount =
          totalAmount.add(
            item.totalPrice
          );
      }

      // -----------------------------------------------------
      // CREATE ORDER
      // -----------------------------------------------------

      const createdOrder =
        await tx.order.create({
          data: {
            userId,

            restaurantId:
              RESTAURANT_ID,

            /*
            | Client cannot control this.
            */

            status: "PENDING",

            totalAmount,
          },
        });

      // -----------------------------------------------------
      // CREATE ORDER ITEMS
      // -----------------------------------------------------

      for (const item of processedItems) {
        const orderItem =
          await tx.orderItem.create({
            data: {
              orderId:
                createdOrder.id,

              /*
              | Database reference.
              */

              menuItemVariantId:
                item.variant.id,

              /*
              | Snapshot.
              */

              itemName:
                item.variant.menuItem.name,

              variantName:
                item.variant.name,

              unitPrice:
                item.unitPrice,

              quantity:
                item.quantity,

              totalPrice:
                item.totalPrice,
            },
          });

        // ---------------------------------------------------
        // CREATE COMBO CHOICES
        // ---------------------------------------------------

        if (
          item.choices.length > 0
        ) {
          await tx.orderItemChoice.createMany(
            {
              data:
                item.choices.map(
                  (choice) => ({
                    orderItemId:
                      orderItem.id,

                    choiceGroupId:
                      choice.choiceGroupId,

                    choiceGroupName:
                      choice.choiceGroupName,

                    menuItemVariantId:
                      choice.menuItemVariantId,

                    optionName:
                      choice.optionName,

                    optionVariantName:
                      choice.optionVariantName,
                  })
                ),
            }
          );
        }
      }

      return createdOrder;
    }
  );

  // ---------------------------------------------------------
  // RETURN CLEAN ORDER RESPONSE
  // ---------------------------------------------------------

  return getOrderById(
    order.id,
    userId
  );
};

/*
|--------------------------------------------------------------------------
| GET ONE ORDER
|--------------------------------------------------------------------------
*/

export const getOrderById = async (
  orderId,
  userId
) => {
  const order =
    await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },

      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,

        items: {
          select: {
            id: true,
            itemName: true,
            variantName: true,
            unitPrice: true,
            quantity: true,
            totalPrice: true,

            choices: {
              select: {
                id: true,
                choiceGroupName: true,
                optionName: true,
                optionVariantName: true,
              },
            },
          },
        },
      },
    });

  if (!order) {
  throw new OrderError(
    "Order not found",
    404
  );
}

  return {
    ...order,

    totalAmount:
      Number(order.totalAmount),

    items: order.items.map(
      (item) => ({
        ...item,

        unitPrice:
          Number(item.unitPrice),

        totalPrice:
          Number(item.totalPrice),
      })
    ),
  };
};

/*
|--------------------------------------------------------------------------
| GET USER ORDERS
|--------------------------------------------------------------------------
*/

export const getUserOrders = async (
  userId,
  page = 1,
  limit = 10
) => {
  // ---------------------------------------------------------
  // VALIDATE USER
  // ---------------------------------------------------------

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new OrderError("Invalid user", 400);
  }

  // ---------------------------------------------------------
  // VALIDATE PAGINATION
  // ---------------------------------------------------------

  if (!Number.isInteger(page) || page < 1) {
    throw new OrderError(
      "Page must be a positive integer",
      400
    );
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new OrderError(
      "Limit must be an integer between 1 and 100",
      400
    );
  }

  const skip = (page - 1) * limit;

  // ---------------------------------------------------------
  // GET ORDERS + TOTAL COUNT
  // ---------------------------------------------------------

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,

      take: limit,

      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,

        items: {
          select: {
            id: true,
            itemName: true,
            variantName: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
    }),

    prisma.order.count({
      where: {
        userId,
      },
    }),
  ]);

  // ---------------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------------

  const totalPages =
    totalOrders === 0
      ? 0
      : Math.ceil(totalOrders / limit);

  // ---------------------------------------------------------
  // RETURN CLEAN RESPONSE
  // ---------------------------------------------------------

  return {
    orders: orders.map(
      (order) => ({
        ...order,

        totalAmount:
          Number(order.totalAmount),

        items: order.items.map(
          (item) => ({
            ...item,

            totalPrice:
              Number(item.totalPrice),
          })
        ),
      })
    ),

    pagination: {
      page,
      limit,
      totalOrders,
      totalPages,
      hasNextPage:
        totalPages > 0 &&
        page < totalPages,
      hasPreviousPage:
        page > 1 &&
        page <= totalPages,
    },
  };
};

/*
|--------------------------------------------------------------------------
| CANCEL ORDER
|--------------------------------------------------------------------------
|
| Customer can cancel only:
|
| PENDING   -> CANCELLED
| CONFIRMED -> CANCELLED
|
| Once preparation starts, cancellation is not allowed.
|
| The update is atomic:
| the database itself checks the current status while updating.
|
|--------------------------------------------------------------------------
*/

export const cancelOrder = async (orderId, userId) => {
  return cancelCustomerOrder(orderId, userId);
};