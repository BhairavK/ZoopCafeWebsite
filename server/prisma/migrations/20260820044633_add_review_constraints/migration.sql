/*
Warnings:

- A unique constraint covering the columns `[userId,restaurantId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[userId,menuItemId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
*/

-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_restaurantId_key"
ON "reviews"("userId", "restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_menuItemId_key"
ON "reviews"("userId", "menuItemId");


-- Rating must be between 1 and 5
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_rating_check"
CHECK ("rating" >= 1 AND "rating" <= 5);


-- Variant price must be greater than 0
ALTER TABLE "menu_item_variants"
ADD CONSTRAINT "menu_item_variants_price_check"
CHECK ("price" > 0);


-- Combo quantity must be greater than 0
ALTER TABLE "combo_items"
ADD CONSTRAINT "combo_items_quantity_check"
CHECK ("quantity" > 0);


-- A review must target exactly one thing:
-- either a restaurant OR a menu item, but never both/neither.
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_exactly_one_target_check"
CHECK (
  ("restaurantId" IS NOT NULL AND "menuItemId" IS NULL)
  OR
  ("restaurantId" IS NULL AND "menuItemId" IS NOT NULL)
);