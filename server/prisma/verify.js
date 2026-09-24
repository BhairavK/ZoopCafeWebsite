import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("\n========================================");
  console.log("ZOOP CAFE DATABASE VERIFICATION");
  console.log("========================================\n");

  // =====================================================
  // 1. NORMAL PRODUCTS
  // =====================================================

  const normalProducts = await prisma.menuItem.findMany({
    where: {
      type: "PRODUCT",
      isAvailable: true,
      isComboExclusive: false,
    },
    select: {
      id: true,
      name: true,
      isAvailable: true,
      isComboExclusive: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log("1. NORMAL PRODUCTS");
  console.log("----------------------------------------");
  console.log(`Count: ${normalProducts.length}`);
  console.log(
    normalProducts.slice(0, 10).map((item) => ({
      id: item.id,
      name: item.name,
      isAvailable: item.isAvailable,
      isComboExclusive: item.isComboExclusive,
    }))
  );

  // =====================================================
  // 2. COMBO-EXCLUSIVE PRODUCTS
  // =====================================================

  const comboExclusiveProducts =
    await prisma.menuItem.findMany({
      where: {
        isComboExclusive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        isAvailable: true,
        isComboExclusive: true,
        category: {
          select: {
            name: true,
            isActive: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
          },
        },
      },
    });

  console.log("\n2. COMBO-EXCLUSIVE PRODUCTS");
  console.log("----------------------------------------");
  console.dir(comboExclusiveProducts, {
    depth: null,
  });

  // =====================================================
  // 3. COMBOS
  // =====================================================

  const combos = await prisma.menuItem.findMany({
    where: {
      type: "COMBO",
    },
    select: {
      id: true,
      name: true,
      isAvailable: true,
      isComboExclusive: true,

      variants: {
        select: {
          id: true,
          name: true,
          price: true,
          isAvailable: true,
        },
      },

      comboItems: {
        select: {
          id: true,
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

              menuItemVariant: {
                select: {
                  id: true,
                  name: true,

                  menuItem: {
                    select: {
                      id: true,
                      name: true,
                      isAvailable: true,
                      isComboExclusive: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    orderBy: {
      id: "asc",
    },
  });

  console.log("\n3. COMBOS");
  console.log("----------------------------------------");

  for (const combo of combos) {
    console.log(`\n${combo.name} (ID: ${combo.id})`);

    console.log("  Variant:");
    console.dir(combo.variants, {
      depth: null,
    });

    console.log("  Fixed Items:");

    for (const item of combo.comboItems) {
      console.log(
        `    - ${item.menuItemVariant.menuItem.name}` +
          ` / ${item.menuItemVariant.name}` +
          ` | quantity=${item.quantity}` +
          ` | servingLabel=${item.servingLabel ?? "null"}`
      );
    }

    console.log("  Choice Groups:");

    for (const group of combo.comboChoiceGroups) {
      console.log(
        `    - ${group.name}` +
          ` | type=${group.type}` +
          ` | min=${group.minSelections}` +
          ` | max=${group.maxSelections}` +
          ` | options=${group.options.length}`
      );

      for (const option of group.options) {
        const variant =
          option.menuItemVariant;

        console.log(
          `        → ${variant.menuItem.name}` +
            ` / ${variant.name}` +
            ` | available=${variant.menuItem.isAvailable}` +
            ` | comboExclusive=${variant.menuItem.isComboExclusive}`
        );
      }
    }
  }

  // =====================================================
  // 4. COMBO EXTRAS CATEGORY
  // =====================================================

  const comboExtras =
    await prisma.category.findFirst({
      where: {
        name: "Combo Extras",
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        displayOrder: true,

        menuItems: {
          select: {
            id: true,
            name: true,
            type: true,
            isAvailable: true,
            isComboExclusive: true,

            variants: {
              select: {
                id: true,
                name: true,
                price: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    });

  console.log("\n4. COMBO EXTRAS CATEGORY");
  console.log("----------------------------------------");
  console.dir(comboExtras, {
    depth: null,
  });

  console.log("\n========================================");
  console.log("VERIFICATION COMPLETE");
  console.log("========================================\n");
}

main()
  .catch((error) => {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });