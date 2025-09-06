-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "weight" DECIMAL(65,30),
ADD COLUMN     "weightUnit" TEXT DEFAULT 'g';

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "unitType" TEXT NOT NULL DEFAULT 'weight';
