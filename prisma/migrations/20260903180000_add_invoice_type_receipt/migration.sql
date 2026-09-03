-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'invoice';

-- CreateIndex
CREATE INDEX "Invoice_type_idx" ON "Invoice"("type");

