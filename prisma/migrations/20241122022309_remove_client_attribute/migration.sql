/*
  Warnings:

  - You are about to drop the column `clientId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_clientId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "clientId";

-- DropTable
DROP TABLE "Client";
