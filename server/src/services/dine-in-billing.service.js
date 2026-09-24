import prisma from "../config/prisma.js";

const RESTAURANT_ID = 1;

export const getBillingMenu = async () => {
  const variants = await prisma.menuItemVariant.findMany({
    where: {
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
      displayOrder: true,

      menuItem: {
        select: {
          id: true,
          name: true,
          type: true,
          dietaryType: true,
          displayOrder: true,

          category: {
            select: {
              id: true,
              name: true,
              displayOrder: true,
            },
          },
        },
      },
    },

    orderBy: [
      {
        menuItem: {
          category: {
            displayOrder: "asc",
          },
        },
      },
      {
        menuItem: {
          displayOrder: "asc",
        },
      },
      {
        displayOrder: "asc",
      },
    ],
  });

  return variants.map((variant) => ({
    variantId: variant.id,
    itemId: variant.menuItem.id,

    name: variant.menuItem.name,
    variantName: variant.name,

    price: Number(variant.price),

    type: variant.menuItem.type,
    dietaryType: variant.menuItem.dietaryType,

    categoryId: variant.menuItem.category.id,
    categoryName: variant.menuItem.category.name,
  }));
};