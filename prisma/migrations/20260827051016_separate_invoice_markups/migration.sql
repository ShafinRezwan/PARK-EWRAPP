/*
  Warnings:

  - You are about to drop the column `attachmentId` on the `EWRInvoiceRow` table. All the data in the column will be lost.
  - You are about to drop the column `markup` on the `EWRInvoiceRow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EWRInvoiceRow" DROP COLUMN "attachmentId",
DROP COLUMN "markup";

-- CreateTable
CREATE TABLE "EWRInvoiceMarkupRow" (
    "id" TEXT NOT NULL,
    "markup" DECIMAL(10,2) NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EWRInvoiceMarkupRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EWRInvoiceMarkupRow_reportId_idx" ON "EWRInvoiceMarkupRow"("reportId");

-- AddForeignKey
ALTER TABLE "EWRInvoiceMarkupRow" ADD CONSTRAINT "EWRInvoiceMarkupRow_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
