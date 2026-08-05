/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CONTRACTS', 'SUPERINTENDENT', 'ACCOUNTING', 'PROJECT_MANAGER', 'MASTER_USER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'NEEDS_REVISION', 'APPROVED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CONTRACTS',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "ToDoTask" (
    "id" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "duedate" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "jobId" TEXT,
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "ToDoTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraWorkReport" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "ewrNumber" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "recipent" TEXT,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraWorkReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabourRate" (
    "id" TEXT NOT NULL,
    "employeeNumber" INTEGER NOT NULL,
    "baseWorkClass" TEXT NOT NULL,
    "baseClassName" TEXT NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "saturdayRate" DECIMAL(10,2) NOT NULL,
    "sundayRate" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabourRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentRate" (
    "id" TEXT NOT NULL,
    "equipmentNumber" TEXT NOT NULL,
    "makeModelYear" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "equipmentRate" DECIMAL(10,2) NOT NULL,
    "horsePower" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRate" (
    "id" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "materialUnit" TEXT NOT NULL,

    CONSTRAINT "MaterialRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceType" TEXT NOT NULL,
    "invoiceAmount" DOUBLE PRECISION NOT NULL,
    "invoiceMarkup" DOUBLE PRECISION NOT NULL,
    "attachmentId" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileUrl" TEXT NOT NULL,
    "reportID" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EWRLabourRow" (
    "id" TEXT NOT NULL,
    "employeeNumber" INTEGER,
    "classification" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "Rate" DECIMAL(10,2) NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EWRLabourRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EWREquipmentRow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EWREquipmentRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EWRMaterialRow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EWRMaterialRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EWRInvoiceRow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "markup" DOUBLE PRECISION NOT NULL,
    "attachmentId" TEXT,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EWRInvoiceRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExtraWorkReportToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExtraWorkReportToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ToDoTask_jobId_idx" ON "ToDoTask"("jobId");

-- CreateIndex
CREATE INDEX "ToDoTask_createdById_idx" ON "ToDoTask"("createdById");

-- CreateIndex
CREATE INDEX "ToDoTask_assignedToId_idx" ON "ToDoTask"("assignedToId");

-- CreateIndex
CREATE INDEX "ToDoTask_status_idx" ON "ToDoTask"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");

-- CreateIndex
CREATE INDEX "Job_division_idx" ON "Job"("division");

-- CreateIndex
CREATE INDEX "Job_year_idx" ON "Job"("year");

-- CreateIndex
CREATE INDEX "Job_division_year_idx" ON "Job"("division", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ExtraWorkReport_ewrNumber_key" ON "ExtraWorkReport"("ewrNumber");

-- CreateIndex
CREATE INDEX "ExtraWorkReport_jobId_idx" ON "ExtraWorkReport"("jobId");

-- CreateIndex
CREATE INDEX "ExtraWorkReport_status_idx" ON "ExtraWorkReport"("status");

-- CreateIndex
CREATE INDEX "ExtraWorkReport_workDate_idx" ON "ExtraWorkReport"("workDate");

-- CreateIndex
CREATE UNIQUE INDEX "LabourRate_employeeNumber_key" ON "LabourRate"("employeeNumber");

-- CreateIndex
CREATE INDEX "LabourRate_baseWorkClass_idx" ON "LabourRate"("baseWorkClass");

-- CreateIndex
CREATE INDEX "LabourRate_baseClassName_idx" ON "LabourRate"("baseClassName");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentRate_equipmentNumber_key" ON "EquipmentRate"("equipmentNumber");

-- CreateIndex
CREATE INDEX "EquipmentRate_description_idx" ON "EquipmentRate"("description");

-- CreateIndex
CREATE INDEX "MaterialRate_materialType_idx" ON "MaterialRate"("materialType");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialRate_materialType_materialUnit_key" ON "MaterialRate"("materialType", "materialUnit");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_invoiceId_key" ON "Attachment"("invoiceId");

-- CreateIndex
CREATE INDEX "EWRLabourRow_reportId_idx" ON "EWRLabourRow"("reportId");

-- CreateIndex
CREATE INDEX "EWREquipmentRow_reportId_idx" ON "EWREquipmentRow"("reportId");

-- CreateIndex
CREATE INDEX "EWRMaterialRow_reportId_idx" ON "EWRMaterialRow"("reportId");

-- CreateIndex
CREATE INDEX "EWRInvoiceRow_reportId_idx" ON "EWRInvoiceRow"("reportId");

-- CreateIndex
CREATE INDEX "_ExtraWorkReportToUser_B_index" ON "_ExtraWorkReportToUser"("B");

-- AddForeignKey
ALTER TABLE "ToDoTask" ADD CONSTRAINT "ToDoTask_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToDoTask" ADD CONSTRAINT "ToDoTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToDoTask" ADD CONSTRAINT "ToDoTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraWorkReport" ADD CONSTRAINT "ExtraWorkReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "EWRInvoiceRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EWRLabourRow" ADD CONSTRAINT "EWRLabourRow_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EWREquipmentRow" ADD CONSTRAINT "EWREquipmentRow_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EWRMaterialRow" ADD CONSTRAINT "EWRMaterialRow_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EWRInvoiceRow" ADD CONSTRAINT "EWRInvoiceRow_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExtraWorkReportToUser" ADD CONSTRAINT "_ExtraWorkReportToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExtraWorkReportToUser" ADD CONSTRAINT "_ExtraWorkReportToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
