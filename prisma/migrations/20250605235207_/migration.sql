/*
  Warnings:

  - You are about to drop the column `number` on the `productSkus` table. All the data in the column will be lost.
  - The `pictures` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "productSkus" DROP COLUMN "number";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "pictures",
ADD COLUMN     "pictures" TEXT[],
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
