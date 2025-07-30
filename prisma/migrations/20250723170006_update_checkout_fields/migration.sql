-- CreateEnum
CREATE TYPE "SizeType" AS ENUM ('STANDARD', 'WAIST');

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sizeType" "SizeType" NOT NULL,
    "sizeValue" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "additionalPrice" DOUBLE PRECISION,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
