/*
  Warnings:

  - You are about to drop the column `purchase_price_per_unit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "purchase_price_per_unit";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "price",
ADD COLUMN     "cost" DECIMAL(65,30),
ADD COLUMN     "sellPrice" DECIMAL(65,30);
