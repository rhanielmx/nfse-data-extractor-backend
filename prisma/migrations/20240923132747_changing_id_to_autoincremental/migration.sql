/*
  Warnings:

  - The primary key for the `receipt_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `receipt_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "receipt_items" DROP CONSTRAINT "receipt_items_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id");
