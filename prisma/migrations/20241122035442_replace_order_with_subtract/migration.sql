/*
  Warnings:

  - You are about to drop the column `order` on the `MonthHistory` table. All the data in the column will be lost.
  - You are about to drop the column `returns` on the `MonthHistory` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `YearHistory` table. All the data in the column will be lost.
  - You are about to drop the column `returns` on the `YearHistory` table. All the data in the column will be lost.
  - Added the required column `add` to the `MonthHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtract` to the `MonthHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `add` to the `YearHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtract` to the `YearHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MonthHistory" DROP COLUMN "order",
DROP COLUMN "returns",
ADD COLUMN     "add" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subtract" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "type" SET DEFAULT 'subtract';

-- AlterTable
ALTER TABLE "YearHistory" DROP COLUMN "order",
DROP COLUMN "returns",
ADD COLUMN     "add" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subtract" DOUBLE PRECISION NOT NULL;
