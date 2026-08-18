/*
  Warnings:

  - A unique constraint covering the columns `[jobNumber,year]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Job_jobNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_year_key" ON "Job"("jobNumber", "year");
