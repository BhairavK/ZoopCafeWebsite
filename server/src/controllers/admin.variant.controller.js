import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| GET /api/admin/menu/variants
|--------------------------------------------------------------------------
|
| Used by the admin dashboard when selecting variants for combos.
|
| Optional:
|   ?search=chicken
|   ?category=3
|   ?dietaryType=NON_VEG
|
*/

export const getAdminVariants = async (req, res) => {
  try {
    const { search, category, dietaryType } = req.query;

    const where = {
      isAvailable: true,

      menuItem: {
        isAvailable: true,

        ...(category
          ? {
              categoryId: Number(category),
            }
          : {}),

        ...(dietaryType
          ? {
              dietaryType,
            }
          : {}),

        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
    };

    const variants = await prisma.menuItemVariant.findMany({
      where,

      orderBy: [
        {
          menuItem: {
            displayOrder: "asc",
          },
        },
        {
          displayOrder: "asc",
        },
      ],

      select: {
        id: true,
        name: true,
        price: true,

        menuItem: {
          select: {
            id: true,
            name: true,
            dietaryType: true,
            categoryId: true,
          },
        },
      },
    });

    const data = variants.map((variant) => ({
      variantId: variant.id,
      itemId: variant.menuItem.id,
      itemName: variant.menuItem.name,
      variantName: variant.name,
      price: Number(variant.price),
      dietaryType: variant.menuItem.dietaryType,
      categoryId: variant.menuItem.categoryId,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching admin variants:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch variants",
    });
  }
};