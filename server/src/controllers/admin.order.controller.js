import prisma from "../config/prisma.js";
import { transitionOrderStatus } from "../services/order-status.service.js";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];


/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
*/

export const getAllOrders = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | QUERY PARAMETERS
    |--------------------------------------------------------------------------
    |
    | Examples:
    |
    | GET /api/admin/orders
    | GET /api/admin/orders?status=PENDING
    | GET /api/admin/orders?search=bhairav
    | GET /api/admin/orders?page=2&limit=20
    | GET /api/admin/orders?status=PREPARING&search=bhairav&page=1&limit=10
    |
    |--------------------------------------------------------------------------
    */

    const {
      status,
      search,
    } = req.query;

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const page =
  req.query.page === undefined
    ? 1
    : Number(req.query.page);

const limit =
  req.query.limit === undefined
    ? 20
    : Number(req.query.limit);

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    const skip = (page - 1) * limit;

    /*
    |--------------------------------------------------------------------------
    | STATUS VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
  status &&
  !ORDER_STATUSES.includes(status)
) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | BUILD WHERE CONDITION
    |--------------------------------------------------------------------------
    */

    const where = {};

    // Status filter
    if (status) {
      where.status = status;
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    |
    | Search customer name, email, or order ID.
    |
    */
   if (search && search.length > 100) {
  return res.status(400).json({
    success: false,
    message: "Search query cannot exceed 100 characters",
  });
}

    if (search && search.trim() !== "") {
      const trimmedSearch = search.trim();

      const numericSearch = Number(trimmedSearch);

      where.OR = [
        {
          user: {
            name: {
              contains: trimmedSearch,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: trimmedSearch,
              mode: "insensitive",
            },
          },
        },
      ];

      // If search is a valid integer, also search by order ID.
      if (Number.isInteger(numericSearch)) {
        where.OR.push({
          id: numericSearch,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FETCH ORDERS + TOTAL COUNT
    |--------------------------------------------------------------------------
    |
    | Promise.all allows both database queries to run together.
    |
    */

    const [orders, totalOrders] =
      await Promise.all([
        prisma.order.findMany({
          where,

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
            updatedAt: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            items: {
              select: {
                id: true,
                itemName: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,

                menuItemVariant: {
                  select: {
                    id: true,
                    name: true,

                    menuItem: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),

        prisma.order.count({
          where,
        }),
      ]);

    /*
    |--------------------------------------------------------------------------
    | FORMAT RESPONSE
    |--------------------------------------------------------------------------
    */

    const data = orders.map((order) => ({
      id: order.id,

      status: order.status,

      totalAmount: Number(
        order.totalAmount
      ),

      createdAt: order.createdAt,

      updatedAt: order.updatedAt,

      customer: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },

      items: order.items.map((item) => ({
        id: item.id,

        name: item.itemName,

        quantity: item.quantity,

        unitPrice: Number(
          item.unitPrice
        ),

        totalPrice: Number(
          item.totalPrice
        ),

        variant: item.menuItemVariant
          ? {
              id: item.menuItemVariant.id,

              name: item.menuItemVariant.name,

              itemName:
                item.menuItemVariant
                  .menuItem.name,
            }
          : null,
      })),
    }));

    /*
    |--------------------------------------------------------------------------
    | PAGINATION INFORMATION
    |--------------------------------------------------------------------------
    */

    const totalPages =
      Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,

      data,

      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "Error fetching admin orders:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

export const getOrderById = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,

        /*
        |--------------------------------------------------------------------------
        | CUSTOMER
        |--------------------------------------------------------------------------
        */

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        /*
        |--------------------------------------------------------------------------
        | ORDER ITEMS
        |--------------------------------------------------------------------------
        */

        items: {
          select: {
            id: true,
            itemName: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,

            /*
            |--------------------------------------------------------------------------
            | CURRENT MENU VARIANT
            |--------------------------------------------------------------------------
            |
            | This is useful for the admin dashboard if the menu item
            | still exists.
            |
            */

            menuItemVariant: {
              select: {
                id: true,
                name: true,

                menuItem: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },

            /*
            |--------------------------------------------------------------------------
            | SAVED CHOICES
            |--------------------------------------------------------------------------
            |
            | These come from OrderItemChoice, so they represent what
            | the customer actually selected when ordering.
            |
            */

            choices: {
              select: {
                id: true,
                choiceGroupId: true,
                choiceGroupName: true,
                optionName: true,
                optionVariantName: true,
                menuItemVariantId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FORMAT RESPONSE
    |--------------------------------------------------------------------------
    */

    const data = {
      id: order.id,

      status: order.status,

      totalAmount: Number(
        order.totalAmount
      ),

      createdAt: order.createdAt,

      updatedAt: order.updatedAt,

      customer: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },

      items: order.items.map((item) => ({
        id: item.id,

        name: item.itemName,

        variantName: item.variantName,

        quantity: item.quantity,

        unitPrice: Number(
          item.unitPrice
        ),

        totalPrice: Number(
          item.totalPrice
        ),

        variant: item.menuItemVariant
          ? {
              id: item.menuItemVariant.id,

              name: item.menuItemVariant.name,

              itemName:
                item.menuItemVariant
                  .menuItem.name,
            }
          : null,

        choices: item.choices.map(
          (choice) => ({
            id: choice.id,

            choiceGroupId:
              choice.choiceGroupId,

            choiceGroupName:
              choice.choiceGroupName,

            optionName:
              choice.optionName,

            optionVariantName:
              choice.optionVariantName,

            menuItemVariantId:
              choice.menuItemVariantId,
          })
        ),
      })),
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Error fetching admin order:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await transitionOrderStatus(
      orderId,
      status
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Error updating order status:",
      error
    );

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Failed to update order status",
    });
  }
};