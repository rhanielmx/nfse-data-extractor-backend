-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT,
    "status" TEXT NOT NULL,
    "image" TEXT,
    "customerCNPJ" TEXT,
    "supplierCNPJ" TEXT,
    "receiptValueInCents" INTEGER,
    "receiptNumber" TEXT,
    "documentType" TEXT,
    "issueDate" DATETIME,
    "accrualDate" DATETIME
);
