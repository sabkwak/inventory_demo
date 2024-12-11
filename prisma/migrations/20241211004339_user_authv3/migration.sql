/*
  Warnings:

  - You are about to drop the column `clerkId` on the `UserSettings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserSettings_clerkId_key";

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "clerkId",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;
