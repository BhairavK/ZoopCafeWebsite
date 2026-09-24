-- CreateTable
CREATE TABLE "combo_choice_groups" (
    "id" SERIAL NOT NULL,
    "comboId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "minSelections" INTEGER NOT NULL DEFAULT 1,
    "maxSelections" INTEGER NOT NULL DEFAULT 1,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combo_choice_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo_choice_options" (
    "id" SERIAL NOT NULL,
    "choiceGroupId" INTEGER NOT NULL,
    "menuItemVariantId" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "combo_choice_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "combo_choice_groups_comboId_displayOrder_idx" ON "combo_choice_groups"("comboId", "displayOrder");

-- CreateIndex
CREATE INDEX "combo_choice_options_choiceGroupId_displayOrder_idx" ON "combo_choice_options"("choiceGroupId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "combo_choice_options_choiceGroupId_menuItemVariantId_key" ON "combo_choice_options"("choiceGroupId", "menuItemVariantId");

-- AddForeignKey
ALTER TABLE "combo_choice_groups" ADD CONSTRAINT "combo_choice_groups_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_choice_options" ADD CONSTRAINT "combo_choice_options_choiceGroupId_fkey" FOREIGN KEY ("choiceGroupId") REFERENCES "combo_choice_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_choice_options" ADD CONSTRAINT "combo_choice_options_menuItemVariantId_fkey" FOREIGN KEY ("menuItemVariantId") REFERENCES "menu_item_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
