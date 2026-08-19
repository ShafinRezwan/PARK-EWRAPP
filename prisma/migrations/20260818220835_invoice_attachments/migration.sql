/*
  Warnings:

  - You are about to drop the column `fileSize` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `reportID` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `pathname` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportId` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Attachment_invoiceId_key";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "fileSize",
DROP COLUMN "reportID",
ADD COLUMN     "pathname" TEXT NOT NULL,
ADD COLUMN     "reportId" TEXT NOT NULL,
ALTER COLUMN "invoiceId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Attachment_reportId_idx" ON "Attachment"("reportId");

-- CreateIndex
CREATE INDEX "Attachment_invoiceId_idx" ON "Attachment"("invoiceId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
