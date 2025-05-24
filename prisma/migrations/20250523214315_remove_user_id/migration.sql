/*
  Warnings:

  - You are about to drop the column `userId` on the `MonthHistory` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `YearHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[product,brandId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_product_brandId_userId_key";

-- AlterTable
ALTER TABLE "MonthHistory" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "YearHistory" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Product_product_brandId_key" ON "Product"("product", "brandId");
