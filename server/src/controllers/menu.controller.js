import prisma from "../config/prisma.js";

// =====================================================
// PUBLIC MENU ITEM VISIBILITY
// =====================================================
//
// PRODUCT:
//   isAvailable = true
//   isComboExclusive = false
//
// COMBO:
//   isAvailable = true
//
// This means combo-exclusive products such as Soft Drinks
// can be used inside combos but never appear as standalone
// products in the public menu.
// =====================================================

const PUBLIC_MENU_ITEM_WHERE = {
  isAvailable: true,

  OR: [
    {
      type: "COMBO",
    },
    {
      type: "PRODUCT",
      isComboExclusive: false,
    },
  ],
};


// =====================================================
// GET FULL MENU
// GET /api/menu
// =====================================================

export const getMenu = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        displayOrder: "asc",
      },

      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,

        menuItems: {
          where: PUBLIC_MENU_ITEM_WHERE,

          orderBy: {
            displayOrder: "asc",
          },

          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            type: true,
            dietaryType: true,
            isPopular: true,

            variants: {
              where: {
                isAvailable: true,
              },

              orderBy: {
                displayOrder: "asc",
              },

              select: {
                id: true,
                name: true,
                price: true,
              },
            },

            // -------------------------------------------------
            // FIXED COMBO ITEMS
            // -------------------------------------------------
            //
            // Combo-exclusive products are allowed here.
            // Only unavailable variants / parent products
            // are hidden.
            // -------------------------------------------------

            comboItems: {
              where: {
                menuItemVariant: {
                  isAvailable: true,

                  menuItem: {
                    isAvailable: true,
                  },
                },
              },

              select: {
                menuItemVariantId: true,
                quantity: true,
                servingLabel: true,

                menuItemVariant: {
                  select: {
                    name: true,

                    menuItem: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },

            // -------------------------------------------------
            // COMBO CHOICE GROUPS
            // -------------------------------------------------

            comboChoiceGroups: {
              orderBy: {
                displayOrder: "asc",
              },

              select: {
                id: true,
                name: true,
                type: true,
                minSelections: true,
                maxSelections: true,

                options: {
                  where: {
                    menuItemVariant: {
                      isAvailable: true,

                      menuItem: {
                        isAvailable: true,
                      },
                    },
                  },

                  orderBy: {
                    displayOrder: "asc",
                  },

                  select: {
                    id: true,
                    menuItemVariantId: true,

                    menuItemVariant: {
                      select: {
                        name: true,

                        menuItem: {
                          select: {
                            name: true,
                          },
                        },
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

    const data = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,

      items: category.menuItems.map((item) => {
        const response = {
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          type: item.type,
          dietaryType: item.dietaryType,
          isPopular: item.isPopular,

          variants: item.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            price: Number(variant.price),
          })),
        };

        // ---------------------------------------------------
        // COMBO DETAILS
        // ---------------------------------------------------

        if (item.type === "COMBO") {
          response.comboItems = item.comboItems.map(
            (comboItem) => ({
              variantId: comboItem.menuItemVariantId,
              name: comboItem.menuItemVariant.menuItem.name,
              variantName: comboItem.menuItemVariant.name,
              quantity: comboItem.quantity,
              servingLabel: comboItem.servingLabel,
            })
          );

          response.choiceGroups =
            item.comboChoiceGroups.map((group) => ({
              id: group.id,
              name: group.name,
              type: group.type,
              minSelections: group.minSelections,
              maxSelections: group.maxSelections,

              options: group.options.map((option) => ({
                id: option.id,
                variantId: option.menuItemVariantId,
                name: option.menuItemVariant.menuItem.name,
                variantName: option.menuItemVariant.name,
              })),
            }));
        }

        return response;
      }),
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
    });
  }
};


// =====================================================
// GET SINGLE MENU ITEM
// GET /api/menu/items/:id
// =====================================================

export const getMenuItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item id",
      });
    }

    const item = await prisma.menuItem.findFirst({
      where: {
        id,

        isAvailable: true,

        category: {
          isActive: true,
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

      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        type: true,
        dietaryType: true,
        isPopular: true,

        variants: {
          where: {
            isAvailable: true,
          },

          orderBy: {
            displayOrder: "asc",
          },

          select: {
            id: true,
            name: true,
            price: true,
          },
        },

        // -------------------------------------------------
        // FIXED COMBO ITEMS
        // -------------------------------------------------

        comboItems: {
          where: {
            menuItemVariant: {
              isAvailable: true,

              menuItem: {
                isAvailable: true,
              },
            },
          },

          select: {
            menuItemVariantId: true,
            quantity: true,
            servingLabel: true,

            menuItemVariant: {
              select: {
                name: true,

                menuItem: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },

        // -------------------------------------------------
        // CHOICE GROUPS
        // -------------------------------------------------

        comboChoiceGroups: {
          orderBy: {
            displayOrder: "asc",
          },

          select: {
            id: true,
            name: true,
            type: true,
            minSelections: true,
            maxSelections: true,

            options: {
              where: {
                menuItemVariant: {
                  isAvailable: true,

                  menuItem: {
                    isAvailable: true,
                  },
                },
              },

              orderBy: {
                displayOrder: "asc",
              },

              select: {
                id: true,
                menuItemVariantId: true,

                menuItemVariant: {
                  select: {
                    name: true,

                    menuItem: {
                      select: {
                        name: true,
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

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const response = {
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      type: item.type,
      dietaryType: item.dietaryType,
      isPopular: item.isPopular,

      variants: item.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
      })),
    };

    // -----------------------------------------------------
    // COMBO DETAILS
    // -----------------------------------------------------

    if (item.type === "COMBO") {
      response.comboItems = item.comboItems.map(
        (comboItem) => ({
          variantId: comboItem.menuItemVariantId,
          name: comboItem.menuItemVariant.menuItem.name,
          variantName: comboItem.menuItemVariant.name,
          quantity: comboItem.quantity,
          servingLabel: comboItem.servingLabel,
        })
      );

      response.choiceGroups =
        item.comboChoiceGroups.map((group) => ({
          id: group.id,
          name: group.name,
          type: group.type,
          minSelections: group.minSelections,
          maxSelections: group.maxSelections,

          options: group.options.map((option) => ({
            id: option.id,
            variantId: option.menuItemVariantId,
            name: option.menuItemVariant.menuItem.name,
            variantName: option.menuItemVariant.name,
          })),
        }));
    }

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching menu item:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
    });
  }
};


// =====================================================
// SEARCH MENU
// GET /api/menu/search?q=burger
// =====================================================

export const searchMenu = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const items = await prisma.menuItem.findMany({
      where: {
        ...PUBLIC_MENU_ITEM_WHERE,

        category: {
          isActive: true,
        },

        name: {
          contains: query,
          mode: "insensitive",
        },
      },

      orderBy: [
        {
          isPopular: "desc",
        },
        {
          displayOrder: "asc",
        },
      ],

      select: {
        id: true,
        name: true,
        imageUrl: true,
        type: true,
        dietaryType: true,
        isPopular: true,

        variants: {
          where: {
            isAvailable: true,
          },

          orderBy: {
            displayOrder: "asc",
          },

          select: {
            id: true,
            name: true,
            price: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const data = items.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      type: item.type,
      dietaryType: item.dietaryType,
      isPopular: item.isPopular,

      category: {
        id: item.category.id,
        name: item.category.name,
      },

      variants: item.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
      })),
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error searching menu:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search menu",
    });
  }
};


// =====================================================
// FILTER MENU
// GET /api/menu/items?category=3&dietaryType=VEG&type=PRODUCT&popular=true
// =====================================================

export const filterMenu = async (req, res) => {
  try {
    const {
      category,
      dietaryType,
      type,
      popular,
    } = req.query;

    const where = {
      ...PUBLIC_MENU_ITEM_WHERE,

      category: {
        isActive: true,
      },
    };

    // ---------------------------------------------------
    // CATEGORY
    // ---------------------------------------------------

    if (category !== undefined) {
      const categoryId = Number(category);

      if (
        !Number.isInteger(categoryId) ||
        categoryId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }

      where.categoryId = categoryId;
    }

    // ---------------------------------------------------
    // DIETARY TYPE
    // ---------------------------------------------------

    if (dietaryType !== undefined) {
      const allowed = [
        "VEG",
        "NON_VEG",
        "EGG",
      ];

      if (!allowed.includes(dietaryType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid dietaryType",
        });
      }

      where.dietaryType = dietaryType;
    }

    // ---------------------------------------------------
    // TYPE
    // ---------------------------------------------------

    if (type !== undefined) {
      const allowed = [
        "PRODUCT",
        "COMBO",
      ];

      if (!allowed.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type",
        });
      }

      // If the caller explicitly asks for PRODUCT,
      // return only normal standalone products.
      if (type === "PRODUCT") {
        where.type = "PRODUCT";
        where.isComboExclusive = false;
      }

      // If COMBO is requested, only combos are returned.
      if (type === "COMBO") {
        where.type = "COMBO";

        // COMBO items should never be combo-exclusive.
        where.isComboExclusive = false;
      }
    }

    // ---------------------------------------------------
    // POPULAR
    // ---------------------------------------------------

    if (popular !== undefined) {
      if (
        popular !== "true" &&
        popular !== "false"
      ) {
        return res.status(400).json({
          success: false,
          message: "popular must be true or false",
        });
      }

      where.isPopular = popular === "true";
    }

    const items = await prisma.menuItem.findMany({
      where,

      orderBy: {
        displayOrder: "asc",
      },

      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        type: true,
        dietaryType: true,
        isPopular: true,

        category: {
          select: {
            id: true,
            name: true,
          },
        },

        variants: {
          where: {
            isAvailable: true,
          },

          orderBy: {
            displayOrder: "asc",
          },

          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    const data = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      type: item.type,
      dietaryType: item.dietaryType,
      isPopular: item.isPopular,

      category: {
        id: item.category.id,
        name: item.category.name,
      },

      variants: item.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
      })),
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error filtering menu:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to filter menu",
    });
  }
};