-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "filename" TEXT,
    "status" TEXT NOT NULL,
    "image" TEXT,
    "customer" TEXT,
    "supplier" TEXT,
    "receiptValueInCents" INTEGER,
    "issValueInCents" INTEGER,
    "receiptNumber" TEXT,
    "documentType" TEXT,
    "issueDate" TIMESTAMP(3),
    "accrualDate" TIMESTAMP(3),

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receipts_supplier_customer_receiptNumber_key" ON "receipts"("supplier", "customer", "receiptNumber");
