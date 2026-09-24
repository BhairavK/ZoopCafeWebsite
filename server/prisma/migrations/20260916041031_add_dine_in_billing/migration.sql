-- CreateEnum
CREATE TYPE "DineInTableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "DineInBillStatus" AS ENUM ('OPEN', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "dine_in_tables" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "status" "DineInTableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dine_in_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dine_in_bills" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "status" "DineInBillStatus" NOT NULL DEFAULT 'OPEN',
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dine_in_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dine_in_bill_items" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "menuItemVariantId" INTEGER,
    "itemName" TEXT NOT NULL,
    "variantName" TEXT,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dine_in_bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dine_in_tables_restaurantId_status_idx" ON "dine_in_tables"("restaurantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "dine_in_tables_restaurantId_tableNumber_key" ON "dine_in_tables"("restaurantId", "tableNumber");

-- CreateIndex
CREATE INDEX "dine_in_bills_tableId_status_idx" ON "dine_in_bills"("tableId", "status");

-- CreateIndex
CREATE INDEX "dine_in_bills_status_createdAt_idx" ON "dine_in_bills"("status", "createdAt");

-- CreateIndex
CREATE INDEX "dine_in_bill_items_billId_idx" ON "dine_in_bill_items"("billId");

-- CreateIndex
CREATE INDEX "dine_in_bill_items_menuItemVariantId_idx" ON "dine_in_bill_items"("menuItemVariantId");

-- AddForeignKey
ALTER TABLE "dine_in_tables" ADD CONSTRAINT "dine_in_tables_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dine_in_bills" ADD CONSTRAINT "dine_in_bills_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "dine_in_tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dine_in_bill_items" ADD CONSTRAINT "dine_in_bill_items_billId_fkey" FOREIGN KEY ("billId") REFERENCES "dine_in_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dine_in_bill_items" ADD CONSTRAINT "dine_in_bill_items_menuItemVariantId_fkey" FOREIGN KEY ("menuItemVariantId") REFERENCES "menu_item_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
