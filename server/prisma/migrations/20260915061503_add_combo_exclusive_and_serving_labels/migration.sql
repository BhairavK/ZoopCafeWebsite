-- CreateEnum
CREATE TYPE "ComboChoiceGroupType" AS ENUM ('MOCKTAIL', 'SOFT_DRINK', 'CUSTOM');

-- AlterTable
ALTER TABLE "combo_choice_groups" ADD COLUMN     "type" "ComboChoiceGroupType" NOT NULL DEFAULT 'CUSTOM';

-- AlterTable
ALTER TABLE "combo_items" ADD COLUMN     "servingLabel" TEXT;

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "isComboExclusive" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "combo_choice_groups_comboId_type_idx" ON "combo_choice_groups"("comboId", "type");

-- CreateIndex
CREATE INDEX "combo_items_menuItemVariantId_idx" ON "combo_items"("menuItemVariantId");

-- CreateIndex
CREATE INDEX "menu_items_categoryId_isComboExclusive_idx" ON "menu_items"("categoryId", "isComboExclusive");
