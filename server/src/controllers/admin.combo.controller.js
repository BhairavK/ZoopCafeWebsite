import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getRestaurant = async () => {
  return prisma.restaurant.findFirst({
    select: {
      id: true,
    },
  });
};

const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};

const isNonNegativeInteger = (value) => {
  return Number.isInteger(value) && value >= 0;
};

const isBoolean = (value) => {
  return typeof value === "boolean";
};

const isValidPrice = (value) => {
  if (typeof value === "boolean") return false;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0;
};

const isValidString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

const VALID_CHOICE_GROUP_TYPES = [
  "MOCKTAIL",
  "SOFT_DRINK",
  "CUSTOM",
];

const isValidChoiceGroupType = (value) => {
  return VALID_CHOICE_GROUP_TYPES.includes(value);
};
/*
|--------------------------------------------------------------------------
| GET ALL COMBO ITEMS
|--------------------------------------------------------------------------
| GET /api/admin/combos/available-items
*/
export const getAvailableComboItems = async (req, res) => {
  try {
    const restaurant = await getRestaurant();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const variants = await prisma.menuItemVariant.findMany({
      where: {
        menuItem: {
          type: "PRODUCT",
          category: {
            restaurantId: restaurant.id,
          },
        },
      },
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        {
          menuItem: {
            name: "asc",
          },
        },
        {
          name: "asc",
        },
      ],
    });

    const data = variants.map((variant) => ({
      variantId: variant.id,
      variantName: variant.name,
      price: variant.price,

      variantIsAvailable: variant.isAvailable,

      itemId: variant.menuItem.id,
      name: variant.menuItem.name,
      type: variant.menuItem.type,
      dietaryType: variant.menuItem.dietaryType,

      itemIsAvailable: variant.menuItem.isAvailable,
      isComboExclusive: variant.menuItem.isComboExclusive,

      categoryId: variant.menuItem.categoryId,
      categoryName: variant.menuItem.category?.name || null,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get available combo items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch combo items",
    });
  }
};
/*
|--------------------------------------------------------------------------
| GET ALL COMBOS
|--------------------------------------------------------------------------
| GET /api/admin/combos
*/

export const getAllCombos = async (req, res) => {
  try {
    const restaurant = await getRestaurant();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const combos = await prisma.menuItem.findMany({
      where: {
        type: "COMBO",
        category: {
          restaurantId: restaurant.id,
        },
      },

      orderBy: {
        displayOrder: "asc",
      },

      select: {
        id: true,
        categoryId: true,
        name: true,
        description: true,
        imageUrl: true,
        dietaryType: true,
        isPopular: true,
        isAvailable: true,
        displayOrder: true,

        variants: {
          orderBy: {
            displayOrder: "asc",
          },

          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
            displayOrder: true,
          },
        },

        comboItems: {
          select: {
            id: true,
            menuItemVariantId: true,
            quantity: true,
            servingLabel: true,

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
            displayOrder: true,

            options: {
              orderBy: {
                displayOrder: "asc",
              },

              select: {
                id: true,
                menuItemVariantId: true,
                displayOrder: true,

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
        },
      },
    });

    const data = combos.map((combo) => ({
      id: combo.id,
      categoryId: combo.categoryId,
      name: combo.name,
      description: combo.description,
      imageUrl: combo.imageUrl,
      dietaryType: combo.dietaryType,
      isPopular: combo.isPopular,
      isAvailable: combo.isAvailable,
      displayOrder: combo.displayOrder,

      variants: combo.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        isAvailable: variant.isAvailable,
        displayOrder: variant.displayOrder,
      })),

      comboItems: combo.comboItems.map((item) => ({
        id: item.id,
        variantId: item.menuItemVariantId,
        itemId: item.menuItemVariant.menuItem.id,
        name: item.menuItemVariant.menuItem.name,
        variantName: item.menuItemVariant.name,
        quantity: item.quantity,
        servingLabel: item.servingLabel,
      })),

      choiceGroups: combo.comboChoiceGroups.map((group) => ({
        id: group.id,
        name: group.name,
        type: group.type,
        minSelections: group.minSelections,
        maxSelections: group.maxSelections,
        displayOrder: group.displayOrder,

        options: group.options.map((option) => ({
          id: option.id,
          variantId: option.menuItemVariantId,
          itemId: option.menuItemVariant.menuItem.id,
          name: option.menuItemVariant.menuItem.name,
          variantName: option.menuItemVariant.name,
          displayOrder: option.displayOrder,
        })),
      })),
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching admin combos:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch combos",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET SINGLE COMBO
|--------------------------------------------------------------------------
| GET /api/admin/combos/:id
*/

export const getComboById = async (req, res) => {
  try {
    const comboId = Number(req.params.id);

    if (!isPositiveInteger(comboId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid combo ID",
      });
    }

    const restaurant = await getRestaurant();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const combo = await prisma.menuItem.findFirst({
      where: {
        id: comboId,
        type: "COMBO",
        category: {
          restaurantId: restaurant.id,
        },
      },

      select: {
        id: true,
        categoryId: true,
        name: true,
        description: true,
        imageUrl: true,
        dietaryType: true,
        isPopular: true,
        isAvailable: true,
        displayOrder: true,

        variants: {
          orderBy: {
            displayOrder: "asc",
          },

          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
            displayOrder: true,
          },
        },

        comboItems: {
          select: {
            id: true,
            menuItemVariantId: true,
            quantity: true,
            servingLabel: true,

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
            displayOrder: true,

            options: {
              orderBy: {
                displayOrder: "asc",
              },

              select: {
                id: true,
                menuItemVariantId: true,
                displayOrder: true,

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
        },
      },
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    const data = {
      id: combo.id,
      categoryId: combo.categoryId,
      name: combo.name,
      description: combo.description,
      imageUrl: combo.imageUrl,
      dietaryType: combo.dietaryType,
      isPopular: combo.isPopular,
      isAvailable: combo.isAvailable,
      displayOrder: combo.displayOrder,

      variants: combo.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        isAvailable: variant.isAvailable,
        displayOrder: variant.displayOrder,
      })),

      comboItems: combo.comboItems.map((item) => ({
        id: item.id,
        variantId: item.menuItemVariantId,
        itemId: item.menuItemVariant.menuItem.id,
        name: item.menuItemVariant.menuItem.name,
        variantName: item.menuItemVariant.name,
        quantity: item.quantity,
        servingLabel: item.servingLabel,
      })),

      choiceGroups: combo.comboChoiceGroups.map((group) => ({
        id: group.id,
        name: group.name,
        type: group.type,
        minSelections: group.minSelections,
        maxSelections: group.maxSelections,
        displayOrder: group.displayOrder,

        options: group.options.map((option) => ({
          id: option.id,
          variantId: option.menuItemVariantId,
          itemId: option.menuItemVariant.menuItem.id,
          name: option.menuItemVariant.menuItem.name,
          variantName: option.menuItemVariant.name,
          displayOrder: option.displayOrder,
        })),
      })),
    };

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching combo:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch combo",
    });
  }
};


/*
|--------------------------------------------------------------------------
| CREATE COMBO
|--------------------------------------------------------------------------
| POST /api/admin/combos
*/

export const createCombo = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      imageUrl,
      dietaryType,
      isPopular,
      isAvailable,
      displayOrder,
      variants,
      comboItems,
      choiceGroups,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | BASIC VALIDATION
    |--------------------------------------------------------------------------
    */

    const parsedCategoryId = Number(categoryId);

    if (!isPositiveInteger(parsedCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId",
      });
    }

    if (!isValidString(name)) {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    if (!["VEG", "NON_VEG", "EGG"].includes(dietaryType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dietaryType",
      });
    }

    if (isPopular !== undefined && !isBoolean(isPopular)) {
      return res.status(400).json({
        success: false,
        message: "isPopular must be a boolean",
      });
    }

    if (isAvailable !== undefined && !isBoolean(isAvailable)) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
      });
    }

    if (
      displayOrder !== undefined &&
      !isNonNegativeInteger(displayOrder)
    ) {
      return res.status(400).json({
        success: false,
        message: "displayOrder must be a non-negative integer",
      });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one combo variant is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RESTAURANT + CATEGORY
    |--------------------------------------------------------------------------
    */

    const restaurant = await getRestaurant();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const category = await prisma.category.findFirst({
      where: {
        id: parsedCategoryId,
        restaurantId: restaurant.id,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE COMBO VARIANTS
    |--------------------------------------------------------------------------
    */

    const variantNames = new Set();

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];

      if (!variant || !isValidString(variant.name)) {
        return res.status(400).json({
          success: false,
          message: `Invalid variant at index ${i}`,
        });
      }

      const variantName = variant.name.trim();

      if (variantNames.has(variantName.toLowerCase())) {
        return res.status(409).json({
          success: false,
          message: `Duplicate combo variant name: ${variantName}`,
        });
      }

      variantNames.add(variantName.toLowerCase());

      if (
        variant.price === undefined ||
        !isValidPrice(variant.price)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for variant at index ${i}`,
        });
      }

      if (
        variant.isAvailable !== undefined &&
        !isBoolean(variant.isAvailable)
      ) {
        return res.status(400).json({
          success: false,
          message: `isAvailable must be a boolean for variant at index ${i}`,
        });
      }

      if (
        variant.displayOrder !== undefined &&
        !isNonNegativeInteger(variant.displayOrder)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `displayOrder must be a non-negative integer for variant at index ${i}`,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE FIXED COMBO ITEMS
    |--------------------------------------------------------------------------
    */

    if (comboItems !== undefined && !Array.isArray(comboItems)) {
      return res.status(400).json({
        success: false,
        message: "comboItems must be an array",
      });
    }

    if (Array.isArray(comboItems)) {
      const fixedVariantIds = new Set();

      for (let i = 0; i < comboItems.length; i++) {
        const item = comboItems[i];

        const variantId = Number(item?.variantId);
        const quantity = Number(item?.quantity);

        if (!isPositiveInteger(variantId)) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid combo item variantId at index ${i}`,
          });
        }

        if (!isPositiveInteger(quantity)) {
          return res.status(400).json({
            success: false,
            message:
              `Combo item quantity must be greater than 0 at index ${i}`,
          });
        }

        if (fixedVariantIds.has(variantId)) {
          return res.status(409).json({
            success: false,
            message:
              `Duplicate combo item variantId: ${variantId}`,
          });
        }

        fixedVariantIds.add(variantId);

        if (
          item.servingLabel !== undefined &&
          item.servingLabel !== null &&
          typeof item.servingLabel !== "string"
        ) {
          return res.status(400).json({
            success: false,
            message:
              `servingLabel must be a string at combo item index ${i}`,
          });
        }
      }

      if (fixedVariantIds.size > 0) {
        const referencedVariants =
          await prisma.menuItemVariant.findMany({
            where: {
              id: {
                in: [...fixedVariantIds],
              },

              menuItem: {
                category: {
                  restaurantId: restaurant.id,
                },
              },
            },

            select: {
              id: true,

              menuItem: {
                select: {
                  id: true,
                  type: true,
                },
              },
            },
          });

        if (referencedVariants.length !== fixedVariantIds.size) {
          return res.status(400).json({
            success: false,
            message:
              "One or more combo item variants are invalid",
          });
        }

        const containsCombo = referencedVariants.some(
          (variant) => variant.menuItem.type === "COMBO"
        );

        if (containsCombo) {
          return res.status(400).json({
            success: false,
            message:
              "A combo cannot contain another combo as a fixed item",
          });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE CHOICE GROUPS
    |--------------------------------------------------------------------------
    */

    if (choiceGroups !== undefined && !Array.isArray(choiceGroups)) {
      return res.status(400).json({
        success: false,
        message: "choiceGroups must be an array",
      });
    }

    if (Array.isArray(choiceGroups)) {
      for (let i = 0; i < choiceGroups.length; i++) {
        const group = choiceGroups[i];

        if (!group || !isValidString(group.name)) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid choice group at index ${i}`,
          });
        }

        const groupType = group.type ?? "CUSTOM";

        if (!isValidChoiceGroupType(groupType)) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid choice group type at index ${i}`,
          });
        }

        const minSelections =
          group.minSelections === undefined
            ? 1
            : Number(group.minSelections);

        const maxSelections =
          group.maxSelections === undefined
            ? 1
            : Number(group.maxSelections);

        const groupDisplayOrder =
          group.displayOrder === undefined
            ? i
            : Number(group.displayOrder);

        if (!isNonNegativeInteger(minSelections)) {
          return res.status(400).json({
            success: false,
            message:
              `minSelections must be a non-negative integer for choice group at index ${i}`,
          });
        }

        if (!isPositiveInteger(maxSelections)) {
          return res.status(400).json({
            success: false,
            message:
              `maxSelections must be a positive integer for choice group at index ${i}`,
          });
        }

        if (minSelections > maxSelections) {
          return res.status(400).json({
            success: false,
            message:
              `minSelections cannot be greater than maxSelections for choice group at index ${i}`,
          });
        }

        if (!isNonNegativeInteger(groupDisplayOrder)) {
          return res.status(400).json({
            success: false,
            message:
              `displayOrder must be a non-negative integer for choice group at index ${i}`,
          });
        }

        if (
          group.options !== undefined &&
          !Array.isArray(group.options)
        ) {
          return res.status(400).json({
            success: false,
            message:
              `options must be an array for choice group at index ${i}`,
          });
        }

        const options = group.options ?? [];
        const optionIds = new Set();

        for (const option of options) {
          const variantId = Number(option?.variantId);

          if (!isPositiveInteger(variantId)) {
            return res.status(400).json({
              success: false,
              message:
                `Invalid choice option variantId in group ${i}`,
            });
          }

          if (optionIds.has(variantId)) {
            return res.status(409).json({
              success: false,
              message:
                `Duplicate choice option variantId: ${variantId}`,
            });
          }

          optionIds.add(variantId);

          if (
            option.displayOrder !== undefined &&
            !isNonNegativeInteger(option.displayOrder)
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Choice option displayOrder must be a non-negative integer",
            });
          }
        }

        if (optionIds.size > 0) {
          const referencedOptions =
            await prisma.menuItemVariant.findMany({
              where: {
                id: {
                  in: [...optionIds],
                },

                menuItem: {
                  category: {
                    restaurantId: restaurant.id,
                  },
                },
              },

              select: {
                id: true,

                menuItem: {
                  select: {
                    type: true,
                  },
                },
              },
            });

          if (referencedOptions.length !== optionIds.size) {
            return res.status(400).json({
              success: false,
              message:
                `One or more choice option variants are invalid in group ${i}`,
            });
          }

          const containsCombo = referencedOptions.some(
            (variant) => variant.menuItem.type === "COMBO"
          );

          if (containsCombo) {
            return res.status(400).json({
              success: false,
              message:
                "Choice options must belong to PRODUCT items",
            });
          }
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE EVERYTHING IN ONE TRANSACTION
    |--------------------------------------------------------------------------
    */

    const combo = await prisma.$transaction(async (tx) => {
      const createdCombo = await tx.menuItem.create({
        data: {
          categoryId: parsedCategoryId,
          name: name.trim(),

          description:
            description === undefined
              ? null
              : description || null,

          imageUrl:
            imageUrl === undefined
              ? null
              : imageUrl || null,

          type: "COMBO",
          dietaryType,
          isPopular: isPopular ?? false,
          isAvailable: isAvailable ?? true,
          isComboExclusive: false,
          displayOrder: displayOrder ?? 0,

          variants: {
            create: variants.map((variant, index) => ({
              name: variant.name.trim(),
              price: Number(variant.price),
              isAvailable: variant.isAvailable ?? true,
              displayOrder:
                variant.displayOrder ?? index,
            })),
          },
        },

        select: {
          id: true,
        },
      });

      /*
      |--------------------------------------------------------------------------
      | FIXED ITEMS
      |--------------------------------------------------------------------------
      */

      if (Array.isArray(comboItems) && comboItems.length > 0) {
        await tx.comboItem.createMany({
          data: comboItems.map((item) => ({
            comboId: createdCombo.id,
            menuItemVariantId: Number(item.variantId),
            quantity: Number(item.quantity),
            servingLabel:
              item.servingLabel?.trim() || null,
          })),
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CHOICE GROUPS + OPTIONS
      |--------------------------------------------------------------------------
      */

      if (Array.isArray(choiceGroups)) {
        for (let i = 0; i < choiceGroups.length; i++) {
          const group = choiceGroups[i];

          const createdGroup =
            await tx.comboChoiceGroup.create({
              data: {
                comboId: createdCombo.id,
                name: group.name.trim(),
                type: group.type ?? "CUSTOM",
                minSelections:
                  group.minSelections ?? 1,
                maxSelections:
                  group.maxSelections ?? 1,
                displayOrder:
                  group.displayOrder ?? i,
              },

              select: {
                id: true,
              },
            });

          const options = group.options ?? [];

          if (options.length > 0) {
            await tx.comboChoiceOption.createMany({
              data: options.map((option, index) => ({
                choiceGroupId: createdGroup.id,
                menuItemVariantId:
                  Number(option.variantId),
                displayOrder:
                  option.displayOrder ?? index,
              })),
            });
          }
        }
      }

      return createdCombo;
    });

    return res.status(201).json({
      success: true,
      message: "Combo created successfully",
      data: {
        id: combo.id,
      },
    });
  } catch (error) {
    console.error("Error creating combo:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Duplicate combo data",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create combo",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE COMBO
|--------------------------------------------------------------------------
| PUT /api/admin/combos/:id
|--------------------------------------------------------------------------
| Full replacement of nested combo configuration when arrays are supplied.
|--------------------------------------------------------------------------
*/

export const updateCombo = async (req, res) => {
  try {
    const comboId = Number(req.params.id);

    if (!isPositiveInteger(comboId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid combo ID",
      });
    }

    const restaurant = await getRestaurant();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const existingCombo = await prisma.menuItem.findFirst({
      where: {
        id: comboId,
        type: "COMBO",
        category: {
          restaurantId: restaurant.id,
        },
      },

      select: {
        id: true,
      },
    });

    if (!existingCombo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    const {
      categoryId,
      name,
      description,
      imageUrl,
      dietaryType,
      isPopular,
      isAvailable,
      displayOrder,
      variants,
      comboItems,
      choiceGroups,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | BASIC FIELD VALIDATION
    |--------------------------------------------------------------------------
    */

    let parsedCategoryId;

    if (categoryId !== undefined) {
      parsedCategoryId = Number(categoryId);

      if (!isPositiveInteger(parsedCategoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      const category = await prisma.category.findFirst({
        where: {
          id: parsedCategoryId,
          restaurantId: restaurant.id,
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    if (name !== undefined && !isValidString(name)) {
      return res.status(400).json({
        success: false,
        message: "name cannot be empty",
      });
    }

    if (
      dietaryType !== undefined &&
      !["VEG", "NON_VEG", "EGG"].includes(dietaryType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid dietaryType",
      });
    }

    if (
      isPopular !== undefined &&
      !isBoolean(isPopular)
    ) {
      return res.status(400).json({
        success: false,
        message: "isPopular must be a boolean",
      });
    }

    if (
      isAvailable !== undefined &&
      !isBoolean(isAvailable)
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
      });
    }

    if (
      displayOrder !== undefined &&
      !isNonNegativeInteger(displayOrder)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "displayOrder must be a non-negative integer",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE REPLACEMENT VARIANTS
    |--------------------------------------------------------------------------
    */

    if (variants !== undefined) {
      if (!Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "variants must be a non-empty array",
        });
      }

      const variantNames = new Set();

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];

        if (!variant || !isValidString(variant.name)) {
          return res.status(400).json({
            success: false,
            message: `Invalid variant at index ${i}`,
          });
        }

        const variantName = variant.name.trim();

        if (
          variantNames.has(
            variantName.toLowerCase()
          )
        ) {
          return res.status(409).json({
            success: false,
            message:
              `Duplicate combo variant name: ${variantName}`,
          });
        }

        variantNames.add(
          variantName.toLowerCase()
        );

        if (
          variant.price === undefined ||
          !isValidPrice(variant.price)
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid price for variant at index ${i}`,
          });
        }

        if (
          variant.isAvailable !== undefined &&
          !isBoolean(variant.isAvailable)
        ) {
          return res.status(400).json({
            success: false,
            message:
              `isAvailable must be a boolean for variant at index ${i}`,
          });
        }

        if (
          variant.displayOrder !== undefined &&
          !isNonNegativeInteger(
            variant.displayOrder
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              `displayOrder must be a non-negative integer for variant at index ${i}`,
          });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE FIXED ITEMS
    |--------------------------------------------------------------------------
    */

    if (comboItems !== undefined) {
      if (!Array.isArray(comboItems)) {
        return res.status(400).json({
          success: false,
          message: "comboItems must be an array",
        });
      }

      const fixedVariantIds = new Set();

      for (let i = 0; i < comboItems.length; i++) {
        const item = comboItems[i];

        const variantId = Number(item?.variantId);
        const quantity = Number(item?.quantity);

        if (!isPositiveInteger(variantId)) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid combo item variantId at index ${i}`,
          });
        }

        if (!isPositiveInteger(quantity)) {
          return res.status(400).json({
            success: false,
            message:
              `Combo item quantity must be greater than 0 at index ${i}`,
          });
        }

        if (fixedVariantIds.has(variantId)) {
          return res.status(409).json({
            success: false,
            message:
              `Duplicate combo item variantId: ${variantId}`,
          });
        }

        fixedVariantIds.add(variantId);

        if (
          item.servingLabel !== undefined &&
          item.servingLabel !== null &&
          typeof item.servingLabel !== "string"
        ) {
          return res.status(400).json({
            success: false,
            message:
              `servingLabel must be a string at combo item index ${i}`,
          });
        }
      }

      if (fixedVariantIds.size > 0) {
        const referencedVariants =
          await prisma.menuItemVariant.findMany({
            where: {
              id: {
                in: [...fixedVariantIds],
              },

              menuItem: {
                category: {
                  restaurantId: restaurant.id,
                },
              },
            },

            select: {
              id: true,

              menuItem: {
                select: {
                  id: true,
                  type: true,
                },
              },
            },
          });

        if (
          referencedVariants.length !==
          fixedVariantIds.size
        ) {
          return res.status(400).json({
            success: false,
            message:
              "One or more combo item variants are invalid",
          });
        }

        if (
          referencedVariants.some(
            (variant) =>
              variant.menuItem.type === "COMBO"
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "A combo cannot contain another combo as a fixed item",
          });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE CHOICE GROUPS
    |--------------------------------------------------------------------------
    */

    if (choiceGroups !== undefined) {
      if (!Array.isArray(choiceGroups)) {
        return res.status(400).json({
          success: false,
          message: "choiceGroups must be an array",
        });
      }

      for (let i = 0; i < choiceGroups.length; i++) {
        const group = choiceGroups[i];

        if (!group || !isValidString(group.name)) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid choice group at index ${i}`,
          });
        }

        const groupType = group.type ?? "CUSTOM";

        if (!isValidChoiceGroupType(groupType)) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid choice group type at index ${i}`,
          });
        }

        const minSelections =
          group.minSelections === undefined
            ? 1
            : Number(group.minSelections);

        const maxSelections =
          group.maxSelections === undefined
            ? 1
            : Number(group.maxSelections);

        const groupDisplayOrder =
          group.displayOrder === undefined
            ? i
            : Number(group.displayOrder);

        if (!isNonNegativeInteger(minSelections)) {
          return res.status(400).json({
            success: false,
            message:
              "minSelections must be a non-negative integer",
          });
        }

        if (!isPositiveInteger(maxSelections)) {
          return res.status(400).json({
            success: false,
            message:
              "maxSelections must be a positive integer",
          });
        }

        if (minSelections > maxSelections) {
          return res.status(400).json({
            success: false,
            message:
              "minSelections cannot be greater than maxSelections",
          });
        }

        if (!isNonNegativeInteger(groupDisplayOrder)) {
          return res.status(400).json({
            success: false,
            message:
              "Choice group displayOrder must be a non-negative integer",
          });
        }

        if (
          group.options !== undefined &&
          !Array.isArray(group.options)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Choice group options must be an array",
          });
        }

        const optionIds = new Set();

        for (const option of group.options ?? []) {
          const variantId = Number(option?.variantId);

          if (!isPositiveInteger(variantId)) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid choice option variantId",
            });
          }

          if (optionIds.has(variantId)) {
            return res.status(409).json({
              success: false,
              message:
                `Duplicate choice option variantId: ${variantId}`,
            });
          }

          optionIds.add(variantId);

          if (
            option.displayOrder !== undefined &&
            !isNonNegativeInteger(
              option.displayOrder
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Choice option displayOrder must be a non-negative integer",
            });
          }
        }

        if (optionIds.size > 0) {
          const referencedOptions =
            await prisma.menuItemVariant.findMany({
              where: {
                id: {
                  in: [...optionIds],
                },

                menuItem: {
                  category: {
                    restaurantId: restaurant.id,
                  },
                },
              },

              select: {
                id: true,

                menuItem: {
                  select: {
                    type: true,
                  },
                },
              },
            });

          if (
            referencedOptions.length !==
            optionIds.size
          ) {
            return res.status(400).json({
              success: false,
              message:
                "One or more choice option variants are invalid",
            });
          }

          if (
            referencedOptions.some(
              (variant) =>
                variant.menuItem.type === "COMBO"
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Choice options must belong to PRODUCT items",
            });
          }
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    const updatedCombo =
      await prisma.$transaction(async (tx) => {
        /*
        |--------------------------------------------------------------------------
        | UPDATE BASIC INFORMATION
        |--------------------------------------------------------------------------
        */

        await tx.menuItem.update({
          where: {
            id: comboId,
          },

          data: {
            ...(parsedCategoryId !== undefined && {
              categoryId: parsedCategoryId,
            }),

            ...(name !== undefined && {
              name: name.trim(),
            }),

            ...(description !== undefined && {
              description: description || null,
            }),

            ...(imageUrl !== undefined && {
              imageUrl: imageUrl || null,
            }),

            ...(dietaryType !== undefined && {
              dietaryType,
            }),

            ...(isPopular !== undefined && {
              isPopular,
            }),

            ...(isAvailable !== undefined && {
              isAvailable,
            }),

            ...(displayOrder !== undefined && {
              displayOrder,
            }),
          },
        });

        /*
        |--------------------------------------------------------------------------
        | REPLACE VARIANTS
        |--------------------------------------------------------------------------
        */

        if (Array.isArray(variants)) {
          await tx.comboItem.deleteMany({
            where: {
              comboId,
            },
          });

          await tx.comboChoiceOption.deleteMany({
            where: {
              choiceGroup: {
                comboId,
              },
            },
          });

          await tx.comboChoiceGroup.deleteMany({
            where: {
              comboId,
            },
          });

          await tx.menuItemVariant.deleteMany({
            where: {
              menuItemId: comboId,
            },
          });

          await tx.menuItemVariant.createMany({
            data: variants.map((variant, index) => ({
              menuItemId: comboId,
              name: variant.name.trim(),
              price: Number(variant.price),
              isAvailable:
                variant.isAvailable ?? true,
              displayOrder:
                variant.displayOrder ?? index,
            })),
          });
        }

        /*
        |--------------------------------------------------------------------------
        | REPLACE FIXED ITEMS
        |--------------------------------------------------------------------------
        */

        if (Array.isArray(comboItems)) {
          await tx.comboItem.deleteMany({
            where: {
              comboId,
            },
          });

          if (comboItems.length > 0) {
            await tx.comboItem.createMany({
              data: comboItems.map((item) => ({
                comboId,
                menuItemVariantId:
                  Number(item.variantId),
                quantity: Number(item.quantity),
                servingLabel:
                  item.servingLabel?.trim() || null,
              })),
            });
          }
        }

        /*
        |--------------------------------------------------------------------------
        | REPLACE CHOICE GROUPS
        |--------------------------------------------------------------------------
        */

        if (Array.isArray(choiceGroups)) {
          await tx.comboChoiceOption.deleteMany({
            where: {
              choiceGroup: {
                comboId,
              },
            },
          });

          await tx.comboChoiceGroup.deleteMany({
            where: {
              comboId,
            },
          });

          for (
            let i = 0;
            i < choiceGroups.length;
            i++
          ) {
            const group = choiceGroups[i];

            const createdGroup =
              await tx.comboChoiceGroup.create({
                data: {
                  comboId,
                  name: group.name.trim(),
                  type: group.type ?? "CUSTOM",
                  minSelections:
                    group.minSelections ?? 1,
                  maxSelections:
                    group.maxSelections ?? 1,
                  displayOrder:
                    group.displayOrder ?? i,
                },

                select: {
                  id: true,
                },
              });

            const options = group.options ?? [];

            if (options.length > 0) {
              await tx.comboChoiceOption.createMany({
                data: options.map(
                  (option, index) => ({
                    choiceGroupId:
                      createdGroup.id,

                    menuItemVariantId:
                      Number(option.variantId),

                    displayOrder:
                      option.displayOrder ??
                      index,
                  })
                ),
              });
            }
          }
        }

        return tx.menuItem.findUnique({
          where: {
            id: comboId,
          },

          select: {
            id: true,
            name: true,
            type: true,
            isAvailable: true,
          },
        });
      });

    return res.status(200).json({
      success: true,
      message: "Combo updated successfully",
      data: updatedCombo,
    });
  } catch (error) {
    console.error("Error updating combo:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Duplicate combo data",
      });
    }

    if (error?.code === "P2003") {
      return res.status(409).json({
        success: false,
        message:
          "Combo cannot be updated because related records exist",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update combo",
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE COMBO
|--------------------------------------------------------------------------
| DELETE /api/admin/combos/:id
*/

export const deleteCombo = async (req, res) => {
  try {
    const comboId = Number(req.params.id);

    if (!isPositiveInteger(comboId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid combo ID",
      });
    }

    const restaurant = await getRestaurant();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const combo = await prisma.menuItem.findFirst({
      where: {
        id: comboId,
        type: "COMBO",
        category: {
          restaurantId: restaurant.id,
        },
      },

      select: {
        id: true,
        name: true,
      },
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    await prisma.menuItem.delete({
      where: {
        id: comboId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Combo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting combo:", error);

    if (error?.code === "P2003") {
      return res.status(409).json({
        success: false,
        message:
          "Combo cannot be deleted because it is referenced by existing records",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete combo",
    });
  }
};