-- Park Paving EWR: PostgreSQL schema based on provided Prisma models.
-- Run only against an empty development database.
-- Identifiers and column types match Prisma's PostgreSQL conventions.
-- IDs: application may supply UUID/cuid text, or use database-generated UUID text.
BEGIN;

CREATE TYPE "Role" AS ENUM ('ADMIN','CONTRACTS','SUPERINTENDENT','ACCOUNTING','PROJECT_MANAGER','MASTER_USER');
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT','PENDING_APPROVAL','NEEDS_REVISION','APPROVED');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING','COMPLETED');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'CONTRACTS',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Job" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "jobNumber" TEXT NOT NULL,
  "address" TEXT,
  "jobName" TEXT NOT NULL,
  "division" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "recipient" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Job_jobNumber_year_key" UNIQUE ("jobNumber", "year")
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ToDoTask" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "task" TEXT NOT NULL,
  "duedate" TIMESTAMP(3) NOT NULL,
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "jobId" TEXT REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "createdById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "assignedToId" TEXT REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ExtraWorkReport" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "ewrNumber" TEXT NOT NULL,
  "workDate" TIMESTAMP(3) NOT NULL,
  "jobId" TEXT REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "address" TEXT,
  "recipient" TEXT,
  "description" TEXT NOT NULL,
  "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ExtraWorkReport_jobId_ewrNumber_key" UNIQUE ("jobId", "ewrNumber")
);

CREATE TABLE "LabourRate" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "employeeNumber" INTEGER NOT NULL UNIQUE,
  "baseWorkClass" TEXT NOT NULL,
  "baseClassName" TEXT NOT NULL,
  "rate" DECIMAL(10,2) NOT NULL,
  "saturdayRate" DECIMAL(10,2) NOT NULL,
  "sundayRate" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EquipmentRate" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "equipmentNumber" TEXT NOT NULL UNIQUE,
  "makeModelYear" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "equipmentRate" DECIMAL(10,2) NOT NULL,
  "horsePower" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "MaterialRate" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "materialType" TEXT NOT NULL,
  "materialUnit" TEXT NOT NULL,
  CONSTRAINT "MaterialRate_materialType_materialUnit_key" UNIQUE ("materialType", "materialUnit")
);

CREATE TABLE "EWRLabourRow" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "employeeNumber" INTEGER,
  "classification" TEXT NOT NULL,
  "hours" DOUBLE PRECISION NOT NULL,
  "rate" DECIMAL(10,2) NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "reportId" TEXT NOT NULL REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EWREquipmentRow" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "name" TEXT NOT NULL,
  "unitNumber" TEXT NOT NULL,
  "hours" DOUBLE PRECISION NOT NULL,
  "rate" DECIMAL(10,2) NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "reportId" TEXT NOT NULL REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EWRMaterialRow" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "name" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "quantity" DECIMAL(10,2) NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "reportId" TEXT NOT NULL REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EWRInvoiceRow" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "name" TEXT NOT NULL,
  "cost" DECIMAL(10,2) NOT NULL,
  "reportId" TEXT NOT NULL REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EWRInvoiceMarkupRow" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "name" TEXT NOT NULL,
  "markup" DECIMAL(10,2) NOT NULL,
  "reportId" TEXT NOT NULL REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Attachment" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "reportId" TEXT NOT NULL REFERENCES "ExtraWorkReport"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "invoiceId" TEXT REFERENCES "EWRInvoiceRow"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "pathname" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Invoice" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "invoiceType" TEXT NOT NULL,
  "invoiceAmount" DOUBLE PRECISION NOT NULL,
  "invoiceMarkup" DOUBLE PRECISION NOT NULL,
  "attachmentId" TEXT REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "ToDoTask_jobId_idx" ON "ToDoTask"("jobId");
CREATE INDEX "ToDoTask_createdById_idx" ON "ToDoTask"("createdById");
CREATE INDEX "ToDoTask_assignedToId_idx" ON "ToDoTask"("assignedToId");
CREATE INDEX "ToDoTask_status_idx" ON "ToDoTask"("status");
CREATE INDEX "Job_division_idx" ON "Job"("division");
CREATE INDEX "Job_year_idx" ON "Job"("year");
CREATE INDEX "Job_division_year_idx" ON "Job"("division","year");
CREATE INDEX "ExtraWorkReport_jobId_idx" ON "ExtraWorkReport"("jobId");
CREATE INDEX "ExtraWorkReport_status_idx" ON "ExtraWorkReport"("status");
CREATE INDEX "ExtraWorkReport_workDate_idx" ON "ExtraWorkReport"("workDate");
CREATE INDEX "LabourRate_baseWorkClass_idx" ON "LabourRate"("baseWorkClass");
CREATE INDEX "LabourRate_baseClassName_idx" ON "LabourRate"("baseClassName");
CREATE INDEX "EquipmentRate_description_idx" ON "EquipmentRate"("description");
CREATE INDEX "MaterialRate_materialType_idx" ON "MaterialRate"("materialType");
CREATE INDEX "EWRLabourRow_reportId_idx" ON "EWRLabourRow"("reportId");
CREATE INDEX "EWREquipmentRow_reportId_idx" ON "EWREquipmentRow"("reportId");
CREATE INDEX "EWRMaterialRow_reportId_idx" ON "EWRMaterialRow"("reportId");
CREATE INDEX "EWRInvoiceRow_reportId_idx" ON "EWRInvoiceRow"("reportId");
CREATE INDEX "EWRInvoiceMarkupRow_reportId_idx" ON "EWRInvoiceMarkupRow"("reportId");
CREATE INDEX "Attachment_reportId_idx" ON "Attachment"("reportId");
CREATE INDEX "Attachment_invoiceId_idx" ON "Attachment"("invoiceId");

COMMIT;
