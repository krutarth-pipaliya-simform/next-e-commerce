/*
  Warnings:

  - Added the required column `fullName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPhone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH_ON_DELIVERY');

-- CreateEnum
CREATE TYPE "DeliverySpeed" AS ENUM ('STANDARD', 'EXPRESS');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "shippingPhone" TEXT NOT NULL,
ADD COLUMN     "shippingTotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "subTotal" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "StoreOrder" ADD COLUMN     "deliverySpeed" "DeliverySpeed" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "shippingFee" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
