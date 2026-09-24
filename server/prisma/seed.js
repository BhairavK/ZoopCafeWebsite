import "dotenv/config";

import {
  PrismaClient,
  MenuItemType,
  DietaryType,
} from "../generated/prisma/client.ts";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const RESTAURANT_NAME = "Zoop Cafe";

/*
|--------------------------------------------------------------------------
| NORMAL MENU
|--------------------------------------------------------------------------
*/

const categories = {
  Tea: `
Masala Tea|20
Ginger Tea|20
Elaichi Tea|20
Badam Tea|20
Black Tea|20
Lemon Tea|20
Coffee|20
Pepper milk|20
Horlicks|25
Boost|25
Bournvita|25
`,

  Soup: `
Veg tomato soup|49
Veg hot & sour soup|59
Veg sweet corn soup|59
Mixed vegetable soup|79
Veg mushroom soup|79
Veg Manchow soup|79
Chicken soup|79
Chicken corn soup|89
Chicken hot & sour soup|99
`,

  Pizza: `
Veg Pizza|169
Sweet corn pizza|185
Paneer Pizza|199
Mushroom Pizza|199
Italian Pizza|199
Babycorn pizza|199
Cheese Pizza|199
Margherita Pizza|199
Chicken Pizza|219
Paneer sweet corn pizza|229
Paneer mushroom pizza|229
Italian Paneer pizza|229
Paneer Babycorn pizza|249
Italian Babycorn pizza|249
Paneer sweet corn mushroom pizza|249
Veg fully loaded pizza|299
Chicken Italian Pizza|249
Chicken Corn Pizza|249
Chicken Paneer Pizza|259
Chicken Mushroom Pizza|259
Chicken Popcorn Pizza|269
Prawn Popcorn Pizza|299
Chicken Fully Loaded Pizza|349
`,

  Burger: `
Veg Burger|59
Veg Cheese Burger|79
Veg Corn Burger|79
Veg Corn Cheese Burger|99
Veg Spicy Burger|79
Veg Spicy Cheese Burger|99
Paneer Burger|99
Paneer Cheese Burger|129
Veg Double Cheese Burger|99
Veg Crispy Burger|79
Veg Cheese Crispy Burger|99
Egg Burger|89
Egg Cheese Burger|109
Chicken Burger|99
Chicken Cheese Burger|119
Chicken Spicy Burger|129
Chicken Spicy Cheese Burger|149
Chicken Crispy Burger|129
Chicken Crispy Cheese Burger|149
Chicken Cheese Double Patty Burger|159
Fish Cheese Burger|149
Prawns Cheese Burger|149
`,

  "French Fries": `
French Fries|59
Large French Fries|75
Peri Peri French Fries|75
Large Peri Peri French Fries|99
Cheese French Fries|99
Large Cheese French Fries|129
`,

  "Veg Snacks": `
Potato Pops (20)|99
Veg Nuggets (10)|99
Veg Smilies (8)|99
Veg Fingers (5)|99
Veg Lolipops (5)|99
Aloo Tikki (5)|99
Onion Rings (5)|99
Small Veg Corn Rolls (6)|99
Baby Corn Strips (6)|99
`,

  "Veg Popcorn": `
Crispy Corn|99
Baby Corn Popcorn|99
Mushroom Pakodi|99
Mushroom Popcorn|119
Paneer Popcorn|129
`,

  Vadapav: `
Mumbai Vadapav|35
Cheese Vadapav|49
Schezwan Vadapav|40
Cheese Schezwan Vadapav|59
`,

  "Pav Bhaji": `
Pav Bhaji|79
Cheese Pav Bhaji|99
Kheema Pav Bhaji|99
Cheese Kheema Pav Bhaji|129
`,

  "Hot Dog": `
Veg Hot Dog|99
Chicken Hot Dog|119
Chicken Cheese Hot Dog|149
`,

  "Egg Snacks": `
Double Egg Omelette|49
Bread Omelette|69
`,

  Momo: `
Steam Veg Momo (5)|69
Steam Paneer Momo (5)|89
Steam Chicken Momo (5)|109
Fried Veg Momo (5)|79
Fried Paneer Momo (5)|99
Fried Chicken Momo (5)|119
`,

  Sandwich: `
Veg Sandwich|79
Corn Sandwich|89
Paneer Sandwich|99
Veg Mixed Sandwich|119
Egg Sandwich|99
Chicken Sandwich|119
Egg Chicken Sandwich|149
Crispy Chicken Sandwich|149
Korean Chicken Sandwich|99
`,

  Roll: `
Veg Roll|79
Veg Corn Roll|89
Paneer Roll|99
Veg Mixed Roll|119
Egg Roll|99
Chicken Roll|119
Chicken Crispy Roll|149
Chicken Egg Roll|149
Chicken Jumbo Roll|149
`,

  "Non-Veg Popcorn": `
Chicken Popcorn|119
Large Chicken Popcorn|149
Fish Popcorn|149
Large Fish Popcorn|219
Prawns Popcorn|169
Large Prawns Popcorn|299
`,

  Strip: `
Chicken Strips (4)|89
Fish Strips (4)|99
Chicken Strips (8)|159
Fish Strips (8)|189
`,

  Finger: `
Chicken Fingers (5)|129
Fish Fingers (5)|149
Chicken Fingers (10)|249
Fish Fingers (10)|289
`,

  "Fried Chicken": `
Fried Chicken (1)|99
Fried Chicken (2)|179
Fried Chicken (3)|259
Fried Chicken (5)|399
`,

  "Chicken Fried Lollipop": `
Chicken Fried Lollipops (2)|99
Chicken Fried Lollipops (4)|189
Chicken Fried Lollipops (8)|349
`,

  "Chicken Fried Small Wings": `
Chicken Fried Small Wings (4)|139
Chicken Fried Small Wings (8)|259
`,

  "Chicken Fried Full Wings": `
Chicken Fried Full Wings (2)|99
Chicken Fried Full Wings (4)|189
Chicken Fried Full Wings (8)|349
`,

  "Chicken Nuggets": `
Chicken Nuggets (5)|99
Chicken Nuggets (10)|189
`,

  "Crab Lollipops": `
Crab Lollipops (5)|159
Crab Lollipops (10)|299
`,

  Buckets: `
Chicken Strips Bucket (20)|399
Chicken Nuggets Bucket (22)|399
Fried Full Chicken Wings (12)|499
Fried Small Chicken Wings (16)|499
Fried Lollipops Bucket (12)|499
Fried Chicken Bucket (10)|499
Chicken Popcorn Bucket|399
Fish Popcorn Bucket|399
Prawns Popcorn Bucket|399
Chicken Mixed Bucket (16)|499
`,

  Manchurian: `
Veg Manchurian|69
Mushroom Manchurian|99
Babycorn Manchurian|149
Chicken Manchurian|169
Prawn Manchurian|249
`,

  "Chicken Hot Full Wings": `
Chicken Hot Full Wings (4)|169
Chicken Hot Full Wings (8)|329
`,

  "Chicken Hot Small Lollipops": `
Chicken Hot Small Lollipops (4)|169
Chicken Hot Small Lollipops (8)|329
`,

  "Chicken Drumsticks": `
Chicken Drumsticks (2)|169
Chicken Drumsticks (4)|329
`,

  "Chicken Hot Lollipops": `
Chicken Hot Lollipops (2)|169
Chicken Hot Lollipops (4)|329
`,

  "Kouju Pitta": `
Kouju Pitta Fry (Normal)|99
Kouju Pitta Fry (KFC Style)|129
`,

  "Korean Chicken Wings": `
Korean Chicken Wings (4)|189
Korean Chicken Wings (8)|349
`,

  "Korean Chicken Strips": `
Korean Chicken Strips (4)|129
Korean Chicken Strips (8)|249
`,

  "Korean Chicken Cheese Balls": `
Korean Chicken Cheese Balls (6)|99
Korean Chicken Cheese Balls (12)|189
`,

  "Egg Kulfi": `
Double Egg Kulfi|30
Egg Chicken Kulfi|59
Egg Chicken Sausage Kulfi|59
`,

  Mocktails: `
Blue Mojito|69
Lemon Ginger|69
Mojito Lime & Mint|69
Orange|69
Rose|69
Vanilla|69
Caramel|79
Green Apple|79
Mixed Fruit|79
Pista|79
Strawberry|79
Watermelon|79
Virgin Mojito|79
`,

  "Cold Coffee": `
Premium Cold Coffee|69
Caramel Cold Coffee|79
`,

  Lassi: `
Lassi|49
Strawberry Lassi|69
Mango Lassi|69
Chocolate Lassi|79
Dry Fruit Lassi|99
`,

  Milkshakes: `
Badam|69
Banana|69
Rose|69
Vanilla|69
Butter Scotch|79
Black Current|79
Caramel|79
Orange|79
Pineapple|79
Strawberry|79
Watermelon|79
Chocolate|89
Mixed Fruit|89
Mango|89
Pista|89
Dry Fruit|99
KitKat Chocolate|99
Oreo Chocolate|99
Rasmalai|99
Sitaphal|99
`,

  Thickshakes: `
Badam|149
Banana|149
Rose|149
Vanilla|149
Butter Scotch|169
Black Current|169
Caramel|169
Orange|169
Pineapple|169
Strawberry|169
Watermelon|169
Chocolate|179
Mixed Fruit|179
Mango|179
Pista|179
Dry Fruit|189
KitKat Chocolate|189
Oreo Chocolate|189
Rasmalai|189
Sitaphal|189
`,

  Waffles: `
Vanilla Waffle|69
Chocolate Waffle|89
Oreo Waffle|89
KitKat Waffle|99
Chocolate Waffle with Choco Chips|99
Chocolate Ice Cream Waffle|129
Naughty Nutella Waffle|99
Triple Chocolate Waffle|129
`,

  "Brownies & Chocolava": `
Chocolava|69
Brownie|79
Brownie Chocochips|99
Brownie with Icecream|129
Sizzling Brownie|149
`,

  "Ice creams": `
Vanilla (1)|29
Vanilla (2)|49
Strawberry (1)|39
Strawberry (2)|59
Butter Scotch (1)|49
Butter Scotch (2)|89
Chocolate (1)|49
Chocolate (2)|89
Black Currant (1)|49
Black Currant (2)|89
Caramel Nuts (1)|69
Caramel Nuts (2)|99
American Dry Nuts (1)|69
American Dry Nuts (2)|99
Triple Scoop Ice Cream|99
Fried Ice Cream|99
`,
};

/*
|--------------------------------------------------------------------------
| COMBOS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| quantity = number of VARIANTS, not number of individual pieces.
|
| Therefore:
|
|   Potato Pops (20) -> quantity 1
|   Chicken Nuggets (5) -> quantity 1
|   Chicken Fried Full Wings (4) -> quantity 1
|
| Some combo descriptions specify fewer pieces than the nearest
| standalone variant. We reference the existing variant once rather
| than creating fake menu variants.
|
|--------------------------------------------------------------------------
*/

const combos = {
  "Veg Combos": [
    {
      name: "Snack Combo - 1",
      price: 199,
      items: [
        ["Small Veg Corn Rolls", "6", 1, "4 Pieces"],
        ["Potato Pops", "20", 1, "10 Pieces"],
        ["Aloo Tikki", "5", 1, "4 Pieces"],
      ],
      mocktail: false,
    },

    {
      name: "Snack Combo - 2",
      price: 279,
      items: [
        ["Fried Veg Momo", "5", 1],
        ["Onion Rings", "5", 1],
        ["French Fries", "Regular", 1],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Pizza Combo",
      price: 299,
      items: [
        ["Cheese Pizza", "Regular", 1],
        ["French Fries", "Regular", 1],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Burger Combo - 1",
      price: 349,
      items: [
        ["Veg Burger", "Regular", 1],
        ["French Fries", "Regular", 1],
        ["Veg Nuggets", "10", 1, "5 Pieces"],
        ["Veg Smilies", "8", 1, "5 Pieces"],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Burger Combo - 2",
      price: 399,
      items: [
        ["Veg Cheese Burger", "Regular", 1],
        ["Veg Smilies", "8", 1],
        ["Potato Pops", "20", 1, "10 Pieces"],
        ["Veg Lolipops", "5", 1, "6 Pieces"],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Pizza Combo - 1",
      price: 499,
      items: [
        ["Paneer Pizza", "Regular", 1],
        ["Large French Fries", "Regular", 1],
        ["Veg Nuggets", "10", 1, "8 Pieces"],
        ["Aloo Tikki", "5", 1, "3 Pieces"],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Pizza Combo - 2",
      price: 449,
      items: [
        ["Paneer Sweet Corn Pizza", "Regular", 1],
        ["French Fries", "Regular", 1],
        ["Veg Fingers", "5", 1],
        ["Veg Burger", "Regular", 1],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Veg Combo Family Feast",
      price: 799,
      items: [
        ["Cheese Pizza", "Regular", 1],
        ["Veg Burger", "Regular", 1],
        ["Large French Fries", "Regular", 1],
        ["Veg Fingers", "5", 1, "4 Pieces"],
        ["Small Veg Corn Rolls", "6", 1, "4 Pieces"],
        ["Veg Lolipops", "5", 1, "4 Pieces"],
        ["Onion Rings", "5", 1, "4 Pieces"],
        ["Potato Pops", "20", 1, "10 Pieces"],
      ],
      mocktail: true,
      mocktailQuantity: 2,
    },
  ],

  "Non-Veg Combos": [
    {
      name: "Fried Chicken Combo",
      price: 199,
      items: [
        ["Chicken Fried Full Wings", "2", 1],
        ["Fried Chicken", "1", 1],
      ],
      mocktail: false,
      softDrink: true,
      softDrinkQuantity: 1,
    },

    {
      name: "Non Veg Burger Combo-1",
      price: 219,
      items: [
        ["Chicken Burger", "Regular", 1],
        ["French Fries", "Regular", 1],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Non Veg Burger Combo-2",
      price: 399,
      items: [
        ["Chicken Cheese Burger", "Regular", 1],
        ["Chicken Sandwich", "Regular", 1],
        ["Chicken Popcorn", "Regular", 1],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Non Veg Snack Combo",
      price: 299,
      items: [
        ["Chicken Popcorn", "Regular", 1],
        ["Chicken Nuggets", "5", 1],
        ["Fried Chicken Momo", "5", 1],
      ],
      mocktail: false,
    },

    {
      name: "Pizza Combo",
      price: 529,
      items: [
        ["Chicken Pizza", "Regular", 1],
        ["Chicken Popcorn", "Regular", 1],
        ["French Fries", "Regular", 1],
        ["Chicken Nuggets", "5", 1, "4 Pieces"],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Bucket Combo",
      price: 799,
      items: [
        ["Chicken Pizza", "Regular", 1],
        ["Chicken Popcorn", "Regular", 1],
        ["French Fries", "Regular", 1],
        ["Fried Chicken", "5", 1],
      ],
      mocktail: true,
      mocktailQuantity: 1,
    },

    {
      name: "Family Feast Combo",
      price: 999,
      items: [
        ["Chicken Pizza", "Regular", 1],
        ["Chicken Burger", "Regular", 1],
        ["Chicken Fried Full Wings", "4", 1],
        ["Chicken Fried Lollipops", "4", 1],
        ["Chicken Nuggets", "5", 1, "8 Pieces"],
        ["French Fries", "Regular", 1],
      ],
      mocktail: true,
      mocktailQuantity: 2,
    },
  ],
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function parseItems(text) {
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const separator = line.lastIndexOf("|");

      const name = line.slice(0, separator).trim();
      const price = Number(line.slice(separator + 1).trim());

      return {
        name,
        price,
      };
    });
}

function extractVariant(name) {
  const match = name.match(/^(.*)\s*\((\d+)\)$/);

  if (!match) {
    return {
      baseName: name.trim(),
      variantName: "Regular",
    };
  }

  return {
    baseName: match[1].trim(),
    variantName: match[2],
  };
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getDietaryType(name) {
  const n = normalizeName(name);

  if (
    n.includes("chicken") ||
    n.includes("fish") ||
    n.includes("prawn") ||
    n.includes("prawns") ||
    n.includes("crab") ||
    n.includes("kheema")
  ) {
    return DietaryType.NON_VEG;
  }

  if (n.includes("egg")) {
    return DietaryType.EGG;
  }

  return DietaryType.VEG;
}

/*
|--------------------------------------------------------------------------
| LOOKUPS
|--------------------------------------------------------------------------
*/

async function findMenuItem(categoryId, name) {
  return prisma.menuItem.findFirst({
    where: {
      categoryId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
}

async function findVariant(menuItemId, variantName) {
  return prisma.menuItemVariant.findFirst({
    where: {
      menuItemId,
      name: {
        equals: variantName,
        mode: "insensitive",
      },
    },
  });
}

/*
|--------------------------------------------------------------------------
| NORMAL MENU
|--------------------------------------------------------------------------
*/

async function seedNormalMenu(restaurant) {
  const categoryMap = new Map();
  const variantMap = new Map();

  let categoryOrder = 0;

  for (const [categoryName, rawItems] of Object.entries(categories)) {
    let category = await prisma.category.findFirst({
      where: {
        restaurantId: restaurant.id,
        name: {
          equals: categoryName,
          mode: "insensitive",
        },
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          restaurantId: restaurant.id,
          name: categoryName,
          displayOrder: categoryOrder,
          isActive: true,
        },
      });
    } else {
      category = await prisma.category.update({
        where: {
          id: category.id,
        },
        data: {
          displayOrder: categoryOrder,
          isActive: true,
        },
      });
    }

    categoryMap.set(categoryName, category);

    const items = parseItems(rawItems);

    const grouped = new Map();

    for (const item of items) {
      const { baseName, variantName } = extractVariant(item.name);

      const key = normalizeName(baseName);

      if (!grouped.has(key)) {
        grouped.set(key, {
          baseName,
          variants: [],
        });
      }

      grouped.get(key).variants.push({
        name: variantName,
        price: item.price,
      });
    }

    let itemOrder = 0;

    for (const group of grouped.values()) {
      let menuItem = await findMenuItem(
        category.id,
        group.baseName
      );

      if (!menuItem) {
        menuItem = await prisma.menuItem.create({
  data: {
    categoryId: category.id,
    name: group.baseName,
    type: MenuItemType.PRODUCT,
    dietaryType: getDietaryType(group.baseName),
    displayOrder: itemOrder,
    isAvailable: true,
    isComboExclusive: false,
  },
});
      } else {
        menuItem = await prisma.menuItem.update({
  where: {
    id: menuItem.id,
  },
  data: {
    type: MenuItemType.PRODUCT,
    dietaryType: getDietaryType(group.baseName),
    displayOrder: itemOrder,
    isAvailable: true,
    isComboExclusive: false,
  },
});
      }

      for (
        let variantOrder = 0;
        variantOrder < group.variants.length;
        variantOrder++
      ) {
        const variantData = group.variants[variantOrder];

        let variant = await findVariant(
          menuItem.id,
          variantData.name
        );

        if (!variant) {
          variant = await prisma.menuItemVariant.create({
            data: {
              menuItemId: menuItem.id,
              name: variantData.name,
              price: variantData.price,
              displayOrder: variantOrder,
              isAvailable: true,
            },
          });
        } else {
          variant = await prisma.menuItemVariant.update({
            where: {
              id: variant.id,
            },
            data: {
              price: variantData.price,
              displayOrder: variantOrder,
              isAvailable: true,
            },
          });
        }

        variantMap.set(
          `${normalizeName(group.baseName)}|${normalizeName(
            variantData.name
          )}`,
          variant
        );
      }

      itemOrder++;
    }

    categoryOrder++;
  }

  return {
    categoryMap,
    variantMap,
  };
}

/*
|--------------------------------------------------------------------------
| COMBO VARIANT LOOKUP
|--------------------------------------------------------------------------
*/

function variantKey(name, variant) {
  return `${normalizeName(name)}|${normalizeName(variant)}`;
}

async function getComboVariant(
  variantMap,
  name,
  variant
) {
  const key = variantKey(name, variant);

  const found = variantMap.get(key);

  if (found) {
    return found;
  }

  const aliases = {
    "veg cheese pizza": "cheese pizza",

    "paneer cheese pizza": "paneer pizza",

    "paneer sweet corn cheese pizza":
      "paneer sweet corn pizza",

    "chicken cheese pizza":
      "chicken pizza",

    "chicken fried wings":
      "chicken fried full wings",

    "fried chicken wings":
      "chicken fried full wings",
  };

  const alias =
    aliases[normalizeName(name)];

  if (alias) {
    const aliasKey =
      variantKey(alias, variant);

    const aliasVariant =
      variantMap.get(aliasKey);

    if (aliasVariant) {
      return aliasVariant;
    }
  }

  throw new Error(
    `Could not find combo item variant: "${name}" (${variant})`
  );
}

/*
|--------------------------------------------------------------------------
| COMBO CREATION
|--------------------------------------------------------------------------
*/

async function createCombo(
  restaurant,
  category,
  comboData,
  variantMap
) {
  let combo = await findMenuItem(
    category.id,
    comboData.name
  );

  if (!combo) {
    combo = await prisma.menuItem.create({
      data: {
        categoryId: category.id,
        name: comboData.name,
        type: MenuItemType.COMBO,
        dietaryType:
          category.name === "Veg Combos"
            ? DietaryType.VEG
            : DietaryType.NON_VEG,
        isAvailable: true,
        isComboExclusive: false,
      },
    });
  } else {
    combo = await prisma.menuItem.update({
      where: {
        id: combo.id,
      },
      data: {
        type: MenuItemType.COMBO,
        dietaryType:
          category.name === "Veg Combos"
            ? DietaryType.VEG
            : DietaryType.NON_VEG,
        isAvailable: true,
        isComboExclusive: false,
      },
    });
  }

  // =====================================================
  // COMBO REGULAR VARIANT
  // =====================================================

  let comboVariant = await findVariant(
    combo.id,
    "Regular"
  );

  if (!comboVariant) {
    comboVariant = await prisma.menuItemVariant.create({
      data: {
        menuItemId: combo.id,
        name: "Regular",
        price: comboData.price,
        displayOrder: 0,
        isAvailable: true,
      },
    });
  } else {
    comboVariant = await prisma.menuItemVariant.update({
      where: {
        id: comboVariant.id,
      },
      data: {
        price: comboData.price,
        isAvailable: true,
      },
    });
  }

  // =====================================================
  // FIXED COMBO ITEMS
  // =====================================================

  await prisma.comboItem.deleteMany({
    where: {
      comboId: combo.id,
    },
  });

  for (const item of comboData.items) {
    const [
      itemName,
      variantName,
      quantity,
      servingLabel,
    ] = item;

    const variant = await getComboVariant(
      variantMap,
      itemName,
      variantName
    );

    await prisma.comboItem.create({
      data: {
        comboId: combo.id,
        menuItemVariantId: variant.id,
        quantity,
        servingLabel: servingLabel ?? null,
      },
    });
  }

  // =====================================================
  // CHOICE GROUPS
  // =====================================================

  await prisma.comboChoiceGroup.deleteMany({
    where: {
      comboId: combo.id,
    },
  });

  // =====================================================
  // MOCKTAIL CHOICE
  // =====================================================

  if (comboData.mocktail) {
    const quantity =
      comboData.mocktailQuantity ?? 1;

    const mocktailGroup =
      await prisma.comboChoiceGroup.create({
        data: {
          comboId: combo.id,
          name:
            quantity === 1
              ? "Choose your Mocktail"
              : `Choose ${quantity} Mocktails`,
          type: "MOCKTAIL",
          minSelections: quantity,
          maxSelections: quantity,
          displayOrder: 0,
        },
      });

    const mocktailNames = [
      "Blue Mojito",
      "Lemon Ginger",
      "Mojito Lime & Mint",
      "Orange",
      "Rose",
      "Vanilla",
      "Caramel",
      "Green Apple",
      "Mixed Fruit",
      "Pista",
      "Strawberry",
      "Watermelon",
      "Virgin Mojito",
    ];

    let displayOrder = 0;

    for (const mocktailName of mocktailNames) {
      const mocktailVariant =
        await getComboVariant(
          variantMap,
          mocktailName,
          "Regular"
        );

      await prisma.comboChoiceOption.create({
        data: {
          choiceGroupId: mocktailGroup.id,
          menuItemVariantId: mocktailVariant.id,
          displayOrder,
        },
      });

      displayOrder++;
    }
  }

  // =====================================================
  // SOFT DRINK CHOICE
  // =====================================================

  if (comboData.softDrink) {
    const softDrinkCategory =
      await getOrCreateHiddenComboExtrasCategory(
        restaurant
      );

    let softDrink = await findMenuItem(
      softDrinkCategory.id,
      "Soft Drink"
    );

    if (!softDrink) {
      softDrink = await prisma.menuItem.create({
        data: {
          categoryId: softDrinkCategory.id,
          name: "Soft Drink",
          type: MenuItemType.PRODUCT,
          dietaryType: DietaryType.VEG,

          // IMPORTANT:
          // It is available for combo usage.
          isAvailable: true,

          // But it is never shown as a standalone menu item.
          isComboExclusive: true,

          displayOrder: 0,
        },
      });
    } else {
      softDrink = await prisma.menuItem.update({
        where: {
          id: softDrink.id,
        },
        data: {
          isAvailable: true,
          isComboExclusive: true,
        },
      });
    }

    let softDrinkVariant = await findVariant(
      softDrink.id,
      "Regular"
    );

    if (!softDrinkVariant) {
      softDrinkVariant =
        await prisma.menuItemVariant.create({
          data: {
            menuItemId: softDrink.id,
            name: "Regular",
            price: 0,
            displayOrder: 0,
            isAvailable: true,
          },
        });
    } else {
      softDrinkVariant =
        await prisma.menuItemVariant.update({
          where: {
            id: softDrinkVariant.id,
          },
          data: {
            price: 0,
            isAvailable: true,
          },
        });
    }

    const quantity =
      comboData.softDrinkQuantity ?? 1;

    const softDrinkGroup =
      await prisma.comboChoiceGroup.create({
        data: {
          comboId: combo.id,
          name:
            quantity === 1
              ? "Soft Drink"
              : `Choose ${quantity} Soft Drinks`,
          type: "SOFT_DRINK",
          minSelections: quantity,
          maxSelections: quantity,
          displayOrder: 1,
        },
      });

    await prisma.comboChoiceOption.create({
      data: {
        choiceGroupId: softDrinkGroup.id,
        menuItemVariantId: softDrinkVariant.id,
        displayOrder: 0,
      },
    });
  }

  return combo;
}

/*
|--------------------------------------------------------------------------
| HIDDEN COMBO EXTRAS CATEGORY
|--------------------------------------------------------------------------
*/

async function getOrCreateHiddenComboExtrasCategory(
  restaurant
) {
  let category = await prisma.category.findFirst({
    where: {
      restaurantId: restaurant.id,
      name: "Combo Extras",
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "Combo Extras",
        description:
          "Internal items used only for combo selections.",
        displayOrder: 9999,
        isActive: false,
      },
    });
  } else {
    category = await prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        isActive: false,
        displayOrder: 9999,
      },
    });
  }

  return category;
}

/*
|--------------------------------------------------------------------------
| SEED COMBOS
|--------------------------------------------------------------------------
*/

async function seedCombos(
  restaurant,
  categoryMap,
  variantMap
) {
  let order = 0;

  for (const [categoryName, comboList] of Object.entries(
    combos
  )) {
    let category = categoryMap.get(categoryName);

    if (!category) {
      category = await prisma.category.findFirst({
        where: {
          restaurantId: restaurant.id,
          name: categoryName,
        },
      });
    }

    if (!category) {
      category = await prisma.category.create({
        data: {
          restaurantId: restaurant.id,
          name: categoryName,
          displayOrder: 1000 + order,
          isActive: true,
        },
      });

      categoryMap.set(categoryName, category);
    }

    for (const comboData of comboList) {
      const combo = await createCombo(
        restaurant,
        category,
        comboData,
        variantMap
      );

      await prisma.menuItem.update({
        where: {
          id: combo.id,
        },
        data: {
          displayOrder: order,
        },
      });

      order++;
    }
  }
}

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

async function main() {
  console.log("🌱 Starting Zoop Cafe seed...\n");

  /*
  * Restaurant
  */

  let restaurant = await prisma.restaurant.findFirst({
    where: {
      name: {
        equals: RESTAURANT_NAME,
        mode: "insensitive",
      },
    },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: RESTAURANT_NAME,
      },
    });
  }

  console.log(`🏪 Restaurant: ${restaurant.name}`);

  /*
  * Normal menu
  */

  const {
    categoryMap,
    variantMap,
  } = await seedNormalMenu(restaurant);

  console.log("✅ Normal menu seeded");

  /*
  * Combos
  */

  await seedCombos(
    restaurant,
    categoryMap,
    variantMap
  );

  console.log("✅ Combos seeded");

  console.log(
    "\n🎉 Zoop Cafe seed completed successfully!"
  );
}

main()
  .catch((error) => {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });