/*
  Warnings:

  - You are about to drop the column `customerCNPJ` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `supplierCNPJ` on the `receipts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_receipts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT,
    "status" TEXT NOT NULL,
    "image" TEXT,
    "customer" TEXT,
    "supplier" TEXT,
    "receiptValueInCents" INTEGER,
    "issValueInCents" INTEGER,
    "receiptNumber" TEXT,
    "documentType" TEXT,
    "issueDate" DATETIME,
    "accrualDate" DATETIME
);
INSERT INTO "new_receipts" ("accrualDate", "documentType", "filename", "id", "image", "issueDate", "receiptNumber", "receiptValueInCents", "status") SELECT "accrualDate", "documentType", "filename", "id", "image", "issueDate", "receiptNumber", "receiptValueInCents", "status" FROM "receipts";
DROP TABLE "receipts";
ALTER TABLE "new_receipts" RENAME TO "receipts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
