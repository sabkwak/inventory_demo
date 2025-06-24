-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "min_stock" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "purchase_price_per_unit" DECIMAL(65,30),
ADD COLUMN     "selling_price_per_unit" DECIMAL(65,30);
