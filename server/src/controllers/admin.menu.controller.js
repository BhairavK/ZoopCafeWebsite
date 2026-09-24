import prisma from "../config/prisma.js";

const VALID_MENU_ITEM_TYPES = [
  "PRODUCT",
  "COMBO",
];

const VALID_DIETARY_TYPES = [
  "VEG",
  "NON_VEG",
  "EGG",
];


/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

export const getAdminCategories = async (req, res) => {
  try {
    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const categories =
      await prisma.category.findMany({
        where: {
          restaurantId: restaurant.id,
        },

        orderBy: {
          displayOrder: "asc",
        },

        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          displayOrder: true,
          isActive: true,

          _count: {
            select: {
              menuItems: true,
            },
          },
        },
      });

    const data = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      itemCount: category._count.menuItems,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Error fetching admin categories:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};


/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/

export const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      imageUrl,
      displayOrder,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (
      displayOrder !== undefined &&
      (
        !Number.isInteger(Number(displayOrder)) ||
        Number(displayOrder) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "displayOrder must be a non-negative integer",
      });
    }

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const categoryName = name.trim();

    const existingCategory =
      await prisma.category.findFirst({
        where: {
          restaurantId: restaurant.id,
          name: categoryName,
        },

        select: {
          id: true,
        },
      });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category =
      await prisma.category.create({
        data: {
          restaurantId: restaurant.id,

          name: categoryName,

          description:
            description !== undefined
              ? description
              : null,

          imageUrl:
            imageUrl !== undefined
              ? imageUrl
              : null,

          displayOrder:
            displayOrder !== undefined
              ? Number(displayOrder)
              : 0,
        },

        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          displayOrder: true,
          isActive: true,
        },
      });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(
      "Error creating category:",
      error
    );

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/

export const updateCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const {
      name,
      description,
      imageUrl,
      displayOrder,
      isActive,
    } = req.body;

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },

        select: {
          id: true,
          restaurantId: true,
        },
      });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (
      name !== undefined &&
      (
        typeof name !== "string" ||
        !name.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }

    if (
      displayOrder !== undefined &&
      (
        !Number.isInteger(Number(displayOrder)) ||
        Number(displayOrder) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "displayOrder must be a non-negative integer",
      });
    }

    if (
      isActive !== undefined &&
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      const duplicateCategory =
        await prisma.category.findFirst({
          where: {
            restaurantId:
              existingCategory.restaurantId,

            name: trimmedName,

            NOT: {
              id: categoryId,
            },
          },

          select: {
            id: true,
          },
        });

      if (duplicateCategory) {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }
    }

    const category =
      await prisma.category.update({
        where: {
          id: categoryId,
        },

        data: {
          ...(name !== undefined && {
            name: name.trim(),
          }),

          ...(description !== undefined && {
            description,
          }),

          ...(imageUrl !== undefined && {
            imageUrl,
          }),

          ...(displayOrder !== undefined && {
            displayOrder: Number(displayOrder),
          }),

          ...(isActive !== undefined && {
            isActive,
          }),
        },

        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          displayOrder: true,
          isActive: true,
        },
      });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(
      "Error updating category:",
      error
    );

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },

        select: {
          id: true,
          name: true,

          _count: {
            select: {
              menuItems: true,
            },
          },
        },
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category._count.menuItems > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete a category containing menu items. Move or delete the items first.",
      });
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting category:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET ALL MENU ITEMS
|--------------------------------------------------------------------------
*/

export const getAdminMenuItems = async (req, res) => {
  try {
    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const items =
      await prisma.menuItem.findMany({
        where: {
          category: {
            restaurantId: restaurant.id,
          },
        },

        orderBy: [
          {
            categoryId: "asc",
          },
          {
            displayOrder: "asc",
          },
        ],

        select: {
          id: true,
          categoryId: true,
          name: true,
          description: true,
          imageUrl: true,
          type: true,
          dietaryType: true,
          isPopular: true,
          isAvailable: true,
          isComboExclusive: true,
          displayOrder: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

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
        },
      });

    const data = items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category.name,

      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,

      type: item.type,
      dietaryType: item.dietaryType,

      isPopular: item.isPopular,
      isAvailable: item.isAvailable,
      isComboExclusive: item.isComboExclusive,
      displayOrder: item.displayOrder,

      variants: item.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        isAvailable: variant.isAvailable,
        displayOrder: variant.displayOrder,
      })),
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Error fetching admin menu items:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET SINGLE MENU ITEM
|--------------------------------------------------------------------------
*/

export const getAdminMenuItemById = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
    }

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const item =
      await prisma.menuItem.findFirst({
        where: {
          id: itemId,

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

          type: true,
          dietaryType: true,

          isPopular: true,
          isAvailable: true,
          isComboExclusive: true,

          displayOrder: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

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
        },
      });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,

      data: {
        id: item.id,

        categoryId: item.categoryId,
        categoryName: item.category.name,

        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,

        type: item.type,
        dietaryType: item.dietaryType,

        isPopular: item.isPopular,
        isAvailable: item.isAvailable,
        isComboExclusive: item.isComboExclusive,

        displayOrder: item.displayOrder,

        variants: item.variants.map(
          (variant) => ({
            id: variant.id,
            name: variant.name,
            price: Number(variant.price),
            isAvailable: variant.isAvailable,
            displayOrder: variant.displayOrder,
          })
        ),
      },
    });
  } catch (error) {
    console.error(
      "Error fetching admin menu item:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
    });
  }
};


/*
|--------------------------------------------------------------------------
| CREATE MENU ITEM
|--------------------------------------------------------------------------
*/

export const createMenuItem = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      imageUrl,
      type,
      dietaryType,
      isPopular,
      isAvailable,
      isComboExclusive,
      displayOrder,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE CATEGORY ID
    |--------------------------------------------------------------------------
    */

    const parsedCategoryId = Number(categoryId);

    if (
      !Number.isInteger(parsedCategoryId) ||
      parsedCategoryId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE NAME
    |--------------------------------------------------------------------------
    */

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Menu item name is required",
      });
    }

    const itemName = name.trim();

    /*
    |--------------------------------------------------------------------------
    | VALIDATE TYPE
    |--------------------------------------------------------------------------
    */

    const itemType = type ?? "PRODUCT";

    if (!VALID_MENU_ITEM_TYPES.includes(itemType)) {
      return res.status(400).json({
        success: false,
        message:
          "type must be either PRODUCT or COMBO",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE DIETARY TYPE
    |--------------------------------------------------------------------------
    */

    if (
      typeof dietaryType !== "string" ||
      !VALID_DIETARY_TYPES.includes(dietaryType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "dietaryType must be VEG, NON_VEG, or EGG",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE BOOLEAN FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      isPopular !== undefined &&
      typeof isPopular !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isPopular must be a boolean",
      });
    }

    if (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
      });
    }

    if (
      isComboExclusive !== undefined &&
      typeof isComboExclusive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isComboExclusive must be a boolean",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | COMBO ITEMS CANNOT BE COMBO-EXCLUSIVE
    |--------------------------------------------------------------------------
    */

    if (
      itemType === "COMBO" &&
      isComboExclusive === true
    ) {
      return res.status(400).json({
        success: false,
        message:
          "COMBO menu items cannot be combo-exclusive",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE DISPLAY ORDER
    |--------------------------------------------------------------------------
    */

    if (
      displayOrder !== undefined &&
      (
        !Number.isInteger(Number(displayOrder)) ||
        Number(displayOrder) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "displayOrder must be a non-negative integer",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET RESTAURANT
    |--------------------------------------------------------------------------
    */

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY CATEGORY
    |--------------------------------------------------------------------------
    */

    const category =
      await prisma.category.findFirst({
        where: {
          id: parsedCategoryId,
          restaurantId: restaurant.id,
        },

        select: {
          id: true,
        },
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found for this restaurant",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE ITEM NAME
    |--------------------------------------------------------------------------
    */

    const existingItem =
      await prisma.menuItem.findFirst({
        where: {
          categoryId: parsedCategoryId,
          name: itemName,
        },

        select: {
          id: true,
        },
      });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message:
          "A menu item with this name already exists in this category",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    const menuItem =
      await prisma.menuItem.create({
        data: {
          categoryId: parsedCategoryId,

          name: itemName,

          description:
            description !== undefined
              ? description
              : null,

          imageUrl:
            imageUrl !== undefined
              ? imageUrl
              : null,

          type: itemType,

          dietaryType,

          isPopular:
            isPopular !== undefined
              ? isPopular
              : false,

          isAvailable:
            isAvailable !== undefined
              ? isAvailable
              : true,

          isComboExclusive:
            isComboExclusive !== undefined
              ? isComboExclusive
              : false,

          displayOrder:
            displayOrder !== undefined
              ? Number(displayOrder)
              : 0,
        },

        select: {
          id: true,
          categoryId: true,
          name: true,
          description: true,
          imageUrl: true,
          type: true,
          dietaryType: true,
          isPopular: true,
          isAvailable: true,
          isComboExclusive: true,
          displayOrder: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

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
        },
      });

    res.status(201).json({
      success: true,

      data: {
        ...menuItem,

        variants: menuItem.variants.map(
          (variant) => ({
            ...variant,
            price: Number(variant.price),
          })
        ),
      },
    });
  } catch (error) {
    console.error(
      "Error creating menu item:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE MENU ITEM
|--------------------------------------------------------------------------
*/

export const updateMenuItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
    }

    const {
      categoryId,
      name,
      description,
      imageUrl,
      type,
      dietaryType,
      isPopular,
      isAvailable,
      isComboExclusive,
      displayOrder,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | GET RESTAURANT
    |--------------------------------------------------------------------------
    */

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET EXISTING ITEM
    |--------------------------------------------------------------------------
    */

    const existingItem =
      await prisma.menuItem.findFirst({
        where: {
          id: itemId,

          category: {
            restaurantId: restaurant.id,
          },
        },

        select: {
          id: true,
          categoryId: true,
          name: true,
          type: true,
          isComboExclusive: true,
        },
      });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE TYPE
    |--------------------------------------------------------------------------
    */

    if (
      type !== undefined &&
      !VALID_MENU_ITEM_TYPES.includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "type must be either PRODUCT or COMBO",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE DIETARY TYPE
    |--------------------------------------------------------------------------
    */

    if (
      dietaryType !== undefined &&
      !VALID_DIETARY_TYPES.includes(dietaryType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "dietaryType must be VEG, NON_VEG, or EGG",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE NAME
    |--------------------------------------------------------------------------
    */

    if (
      name !== undefined &&
      (
        typeof name !== "string" ||
        !name.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE CATEGORY
    |--------------------------------------------------------------------------
    */

    let targetCategoryId =
      existingItem.categoryId;

    if (categoryId !== undefined) {
      targetCategoryId = Number(categoryId);

      if (
        !Number.isInteger(targetCategoryId) ||
        targetCategoryId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      const category =
        await prisma.category.findFirst({
          where: {
            id: targetCategoryId,
            restaurantId: restaurant.id,
          },

          select: {
            id: true,
          },
        });

      if (!category) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found for this restaurant",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE BOOLEAN FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      isPopular !== undefined &&
      typeof isPopular !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isPopular must be a boolean",
      });
    }

    if (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
      });
    }

    if (
      isComboExclusive !== undefined &&
      typeof isComboExclusive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isComboExclusive must be a boolean",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DETERMINE FINAL TYPE / EXCLUSIVE VALUE
    |--------------------------------------------------------------------------
    */

    const finalType =
      type !== undefined
        ? type
        : existingItem.type;

    const finalIsComboExclusive =
      isComboExclusive !== undefined
        ? isComboExclusive
        : existingItem.isComboExclusive;

    /*
    |--------------------------------------------------------------------------
    | COMBOS CANNOT BE COMBO-EXCLUSIVE
    |--------------------------------------------------------------------------
    */

    if (
      finalType === "COMBO" &&
      finalIsComboExclusive === true
    ) {
      return res.status(400).json({
        success: false,
        message:
          "COMBO menu items cannot be combo-exclusive",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE DISPLAY ORDER
    |--------------------------------------------------------------------------
    */

    if (
      displayOrder !== undefined &&
      (
        !Number.isInteger(Number(displayOrder)) ||
        Number(displayOrder) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "displayOrder must be a non-negative integer",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PREVENT INVALID TYPE CHANGE
    |--------------------------------------------------------------------------
    */

    if (
      type !== undefined &&
      type !== existingItem.type
    ) {
      const comboData =
        await prisma.menuItem.findUnique({
          where: {
            id: itemId,
          },

          select: {
            _count: {
              select: {
                comboItems: true,
                comboChoiceGroups: true,
              },
            },
          },
        });

      const hasComboData =
        comboData._count.comboItems > 0 ||
        comboData._count.comboChoiceGroups > 0;

      if (hasComboData) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot change menu item type because it has existing combo configuration. Remove the combo configuration first.",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FINAL NAME
    |--------------------------------------------------------------------------
    */

    const finalName =
      name !== undefined
        ? name.trim()
        : existingItem.name;

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE NAME
    |--------------------------------------------------------------------------
    */

    const duplicateItem =
      await prisma.menuItem.findFirst({
        where: {
          categoryId: targetCategoryId,
          name: finalName,

          NOT: {
            id: itemId,
          },
        },

        select: {
          id: true,
        },
      });

    if (duplicateItem) {
      return res.status(409).json({
        success: false,
        message:
          "A menu item with this name already exists in this category",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    const menuItem =
      await prisma.menuItem.update({
        where: {
          id: itemId,
        },

        data: {
          ...(categoryId !== undefined && {
            categoryId: targetCategoryId,
          }),

          ...(name !== undefined && {
            name: finalName,
          }),

          ...(description !== undefined && {
            description,
          }),

          ...(imageUrl !== undefined && {
            imageUrl,
          }),

          ...(type !== undefined && {
            type: finalType,
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

          ...(isComboExclusive !== undefined && {
            isComboExclusive,
          }),

          ...(displayOrder !== undefined && {
            displayOrder: Number(displayOrder),
          }),
        },

        select: {
          id: true,
          categoryId: true,
          name: true,
          description: true,
          imageUrl: true,
          type: true,
          dietaryType: true,
          isPopular: true,
          isAvailable: true,
          isComboExclusive: true,
          displayOrder: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

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
        },
      });

    res.status(200).json({
      success: true,

      data: {
        ...menuItem,

        variants: menuItem.variants.map(
          (variant) => ({
            ...variant,
            price: Number(variant.price),
          })
        ),
      },
    });
  } catch (error) {
    console.error(
      "Error updating menu item:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE MENU ITEM
|--------------------------------------------------------------------------
*/

export const deleteMenuItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
    }

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const item =
      await prisma.menuItem.findFirst({
        where: {
          id: itemId,

          category: {
            restaurantId: restaurant.id,
          },
        },

        select: {
          id: true,
          name: true,
          type: true,

          variants: {
            select: {
              id: true,

              _count: {
                select: {
                  comboItems: true,
                  comboChoiceOptions: true,
                },
              },
            },
          },

          _count: {
            select: {
              comboItems: true,
              comboChoiceGroups: true,
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

    /*
    |--------------------------------------------------------------------------
    | PREVENT DELETING COMBO WITH CONFIGURATION
    |--------------------------------------------------------------------------
    */

    if (
      item._count.comboItems > 0 ||
      item._count.comboChoiceGroups > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this menu item because it contains combo configuration. Remove the combo configuration first.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PREVENT DELETING VARIANTS USED BY COMBOS
    |--------------------------------------------------------------------------
    */

    const variantUsedInCombo =
      item.variants.some(
        (variant) =>
          variant._count.comboItems > 0 ||
          variant._count.comboChoiceOptions > 0
      );

    if (variantUsedInCombo) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this menu item because one or more variants are used by a combo.",
      });
    }

    await prisma.menuItem.delete({
      where: {
        id: itemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting menu item:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
    });
  }
};


/*
|--------------------------------------------------------------------------
| ADD VARIANT
|--------------------------------------------------------------------------
*/

export const createVariant = async (req, res) => {
  try {
    const menuItemId = Number(req.params.id);

    if (
      !Number.isInteger(menuItemId) ||
      menuItemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
    }

    const {
      name,
      price,
      isAvailable,
      displayOrder,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Variant name is required",
      });
    }

    const variantName = name.trim();

    const parsedPrice = Number(price);

    if (
      price === undefined ||
      price === null ||
      typeof price === "boolean" ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "price must be a valid non-negative number",
      });
    }

    if (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
      });
    }

    if (
      displayOrder !== undefined &&
      (
        !Number.isInteger(Number(displayOrder)) ||
        Number(displayOrder) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "displayOrder must be a non-negative integer",
      });
    }

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const menuItem =
      await prisma.menuItem.findFirst({
        where: {
          id: menuItemId,

          category: {
            restaurantId: restaurant.id,
          },
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const existingVariant =
      await prisma.menuItemVariant.findFirst({
        where: {
          menuItemId,
          name: variantName,
        },

        select: {
          id: true,
        },
      });

    if (existingVariant) {
      return res.status(409).json({
        success: false,
        message:
          "A variant with this name already exists for this menu item",
      });
    }

    const variant =
      await prisma.menuItemVariant.create({
        data: {
          menuItemId,

          name: variantName,

          price: parsedPrice,

          isAvailable:
            isAvailable !== undefined
              ? isAvailable
              : true,

          displayOrder:
            displayOrder !== undefined
              ? Number(displayOrder)
              : 0,
        },

        select: {
          id: true,
          menuItemId: true,
          name: true,
          price: true,
          isAvailable: true,
          displayOrder: true,
        },
      });

    res.status(201).json({
      success: true,

      data: {
        ...variant,
        price: Number(variant.price),
      },
    });
  } catch (error) {
    console.error(
      "Error creating variant:",
      error
    );

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "A variant with this name already exists for this menu item",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create variant",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE VARIANT
|--------------------------------------------------------------------------
*/

export const updateVariant = async (req, res) => {
  try {
    const variantId = Number(req.params.id);

    if (
      !Number.isInteger(variantId) ||
      variantId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    const {
      name,
      price,
      isAvailable,
      displayOrder,
    } = req.body;

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const existingVariant =
      await prisma.menuItemVariant.findFirst({
        where: {
          id: variantId,

          menuItem: {
            category: {
              restaurantId: restaurant.id,
            },
          },
        },

        select: {
          id: true,
          menuItemId: true,
          name: true,
          price: true,
        },
      });

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    if (
      name !== undefined &&
      (
        typeof name !== "string" ||
        !name.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Variant name cannot be empty",
      });
    }

    let parsedPrice;

    if (price !== undefined) {
      parsedPrice = Number(price);

      if (
        typeof price === "boolean" ||
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "price must be a valid non-negative number",
        });
      }
    }

    if (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
      });
    }

    if (
      displayOrder !== undefined &&
      (
        !Number.isInteger(Number(displayOrder)) ||
        Number(displayOrder) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "displayOrder must be a non-negative integer",
      });
    }

    if (name !== undefined) {
      const variantName = name.trim();

      const duplicateVariant =
        await prisma.menuItemVariant.findFirst({
          where: {
            menuItemId:
              existingVariant.menuItemId,

            name: variantName,

            NOT: {
              id: variantId,
            },
          },

          select: {
            id: true,
          },
        });

      if (duplicateVariant) {
        return res.status(409).json({
          success: false,
          message:
            "A variant with this name already exists for this menu item",
        });
      }
    }

    const variant =
      await prisma.menuItemVariant.update({
        where: {
          id: variantId,
        },

        data: {
          ...(name !== undefined && {
            name: name.trim(),
          }),

          ...(price !== undefined && {
            price: parsedPrice,
          }),

          ...(isAvailable !== undefined && {
            isAvailable,
          }),

          ...(displayOrder !== undefined && {
            displayOrder: Number(displayOrder),
          }),
        },

        select: {
          id: true,
          menuItemId: true,
          name: true,
          price: true,
          isAvailable: true,
          displayOrder: true,
        },
      });

    res.status(200).json({
      success: true,

      data: {
        ...variant,
        price: Number(variant.price),
      },
    });
  } catch (error) {
    console.error(
      "Error updating variant:",
      error
    );

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "A variant with this name already exists for this menu item",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update variant",
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE VARIANT
|--------------------------------------------------------------------------
*/

export const deleteVariant = async (req, res) => {
  try {
    const variantId = Number(req.params.id);

    if (
      !Number.isInteger(variantId) ||
      variantId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const variant =
      await prisma.menuItemVariant.findFirst({
        where: {
          id: variantId,

          menuItem: {
            category: {
              restaurantId: restaurant.id,
            },
          },
        },

        select: {
          id: true,
          name: true,
          menuItemId: true,

          menuItem: {
            select: {
              name: true,
            },
          },

          _count: {
            select: {
              comboItems: true,
              comboChoiceOptions: true,
            },
          },
        },
      });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    if (
      variant._count.comboItems > 0 ||
      variant._count.comboChoiceOptions > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this variant because it is used by a combo. Remove it from the combo first.",
      });
    }

    await prisma.menuItemVariant.delete({
      where: {
        id: variantId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting variant:",
      error
    );

    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this variant because it is still referenced by another record.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete variant",
    });
  }
};


/*
|--------------------------------------------------------------------------
| ITEM AVAILABILITY
|--------------------------------------------------------------------------
*/

export const updateItemAvailability = async (
  req,
  res
) => {
  try {
    const itemId = Number(req.params.id);

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
    }

    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
      });
    }

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const item =
      await prisma.menuItem.findFirst({
        where: {
          id: itemId,

          category: {
            restaurantId: restaurant.id,
          },
        },

        select: {
          id: true,
        },
      });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const updatedItem =
      await prisma.menuItem.update({
        where: {
          id: itemId,
        },

        data: {
          isAvailable,
        },

        select: {
          id: true,
          name: true,
          isAvailable: true,
        },
      });

    res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error(
      "Error updating item availability:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update item availability",
    });
  }
};


/*
|--------------------------------------------------------------------------
| VARIANT AVAILABILITY
|--------------------------------------------------------------------------
*/

export const updateVariantAvailability = async (
  req,
  res
) => {
  try {
    const variantId = Number(req.params.id);

    if (
      !Number.isInteger(variantId) ||
      variantId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
      });
    }

    const restaurant =
      await prisma.restaurant.findFirst({
        select: {
          id: true,
        },
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const variant =
      await prisma.menuItemVariant.findFirst({
        where: {
          id: variantId,

          menuItem: {
            category: {
              restaurantId: restaurant.id,
            },
          },
        },

        select: {
          id: true,
        },
      });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    const updatedVariant =
      await prisma.menuItemVariant.update({
        where: {
          id: variantId,
        },

        data: {
          isAvailable,
        },

        select: {
          id: true,
          menuItemId: true,
          name: true,
          isAvailable: true,
        },
      });

    res.status(200).json({
      success: true,
      data: updatedVariant,
    });
  } catch (error) {
    console.error(
      "Error updating variant availability:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update variant availability",
    });
  }
};