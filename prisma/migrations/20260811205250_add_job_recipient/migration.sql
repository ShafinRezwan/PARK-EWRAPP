/*
  Warnings:

  - You are about to drop the column `recipent` on the `ExtraWorkReport` table. All the data in the column will be lost.
  - You are about to drop the `_ExtraWorkReportToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `recipient` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ExtraWorkReportToUser" DROP CONSTRAINT "_ExtraWorkReportToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExtraWorkReportToUser" DROP CONSTRAINT "_ExtraWorkReportToUser_B_fkey";

-- AlterTable
ALTER TABLE "ExtraWorkReport" DROP COLUMN "recipent",
ADD COLUMN     "recipient" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "recipient" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ExtraWorkReportToUser";

-- AddForeignKey
ALTER TABLE "ExtraWorkReport" ADD CONSTRAINT "ExtraWorkReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
