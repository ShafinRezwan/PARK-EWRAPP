/*
  Warnings:

  - A unique constraint covering the columns `[jobId,ewrNumber]` on the table `ExtraWorkReport` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ExtraWorkReport_ewrNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "ExtraWorkReport_jobId_ewrNumber_key" ON "ExtraWorkReport"("jobId", "ewrNumber");
