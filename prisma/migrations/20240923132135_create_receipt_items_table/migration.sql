-- CreateTable
CREATE TABLE "receipt_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" INTEGER NOT NULL,
    "costCenter" INTEGER NOT NULL,
    "activity" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceInCents" INTEGER NOT NULL,
    "receiptId" TEXT NOT NULL,

    CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "receipt_items" ADD CONSTRAINT "receipt_items_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
