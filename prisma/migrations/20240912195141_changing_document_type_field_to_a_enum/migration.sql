/*
  Warnings:

  - The `documentType` column on the `receipts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('148', '31', '150', '77', '219', '154', '147', '221', '117', '16', '4', '5');

-- AlterTable
ALTER TABLE "receipts" DROP COLUMN "documentType",
ADD COLUMN     "documentType" "DocumentType";
