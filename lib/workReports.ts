
import "server-only";

import { pool } from "@/lib/db";

import type {
  EWRFormData,
  WorkReports,
} from "@/types/ewr.types";

// PostgreSQL database row types

type ReportListRow = {
  id: string;
  jobNumber: string | null;
  jobName: string | null;
  address: string | null;
  ewrNumber: string;
  workDate: Date;
  status: WorkReports["status"];
  division: string | null;
  year: number | null;
};

type ReportDetailRow = {
  id: string;
  ewrNumber: string;
  workDate: Date;
  recipient: string | null;
  address: string | null;
  description: string;
  jobId: string | null;
  jobNumber: string | null;
  jobName: string | null;
};

type LabourRow = {
  id: string;
  classification: string;
  hours: number;
  rate: string;
};

type EquipmentRow = {
  id: string;
  name: string;
  unitNumber: string;
  hours: number;
  rate: string;
};

type MaterialRow = {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  price: string;
};

type InvoiceRow = {
  id: string;
  name: string;
  cost: string;
  attachmentId: string | null;
  fileName: string | null;
  fileType: string | null;
};

type InvoiceMarkupRow = {
  id: string;
  name: string;
  markup: string;
};

// Retrieve all work reports

export async function getWorkReports(): Promise<WorkReports[]> {
  const result = await pool.query<ReportListRow>(
    `SELECT
       r."id",
       r."ewrNumber",
       r."workDate",
       r."status",
       r."address",
       j."jobNumber",
       j."jobName",
       j."division",
       j."year"
     FROM "ExtraWorkReport" r
     LEFT JOIN "Job" j
       ON r."jobId" = j."id"
     ORDER BY r."createdAt" DESC`
  );

  return result.rows.map((report) => ({
    id: report.id,
    jobNumber: report.jobNumber ?? "",
    jobName: report.jobName ?? "",
    address: report.address ?? "",
    ewrNumber: report.ewrNumber,
    dateOfWork: report.workDate.toISOString(),
    status: report.status,
    divisionCode: report.division ?? "",
    year: String(report.year ?? ""),
  }));
}

// Retrieve an existing report for editing

export type ExistingWorkReport = {
  id: string;
  ewrNumber: string;
  formData: EWRFormData;
};

export async function getWorkReportById(
  id: string
): Promise<ExistingWorkReport | null> {
  const reportResult = await pool.query<ReportDetailRow>(
    `SELECT
       r."id",
       r."ewrNumber",
       r."workDate",
       r."recipient",
       r."address",
       r."description",
       j."id" AS "jobId",
       j."jobNumber",
       j."jobName"
     FROM "ExtraWorkReport" r
     LEFT JOIN "Job" j
       ON r."jobId" = j."id"
     WHERE r."id" = $1
     LIMIT 1`,
    [id]
  );

  const report = reportResult.rows[0];

  if (!report) {
    return null;
  }

  // Retrieve associated report entries

  const [
    labourResult,
    equipmentResult,
    materialResult,
    invoiceResult,
    markupResult,
  ] = await Promise.all([
    pool.query<LabourRow>(
      `SELECT
         "id",
         "classification",
         "hours",
         "rate"
       FROM "EWRLabourRow"
       WHERE "reportId" = $1`,
      [id]
    ),

    pool.query<EquipmentRow>(
      `SELECT
         "id",
         "name",
         "unitNumber",
         "hours",
         "rate"
       FROM "EWREquipmentRow"
       WHERE "reportId" = $1`,
      [id]
    ),

    pool.query<MaterialRow>(
      `SELECT
         "id",
         "name",
         "unit",
         "quantity",
         "price"
       FROM "EWRMaterialRow"
       WHERE "reportId" = $1`,
      [id]
    ),

    pool.query<InvoiceRow>(
      `SELECT
         i."id",
         i."name",
         i."cost",
         a."id" AS "attachmentId",
         a."fileName",
         a."fileType"
       FROM "EWRInvoiceRow" i
       LEFT JOIN LATERAL (
         SELECT
           "id",
           "fileName",
           "fileType"
         FROM "Attachment"
         WHERE "invoiceId" = i."id"
         LIMIT 1
       ) a ON TRUE
       WHERE i."reportId" = $1`,
      [id]
    ),

    pool.query<InvoiceMarkupRow>(
      `SELECT
         "id",
         "name",
         "markup"
       FROM "EWRInvoiceMarkupRow"
       WHERE "reportId" = $1`,
      [id]
    ),
  ]);

  return {
    id: report.id,
    ewrNumber: report.ewrNumber,

    formData: {
      jobId: report.jobId ?? "",
      recipient: report.recipient ?? "",
      jobNumber: report.jobNumber ?? "",
      jobName: report.jobName ?? "",
      address: report.address ?? "",
      date: report.workDate.toISOString().split("T")[0],
      description: report.description,
      ewrNumber: report.ewrNumber,

      labour: labourResult.rows.map((row) => ({
        id: row.id,
        classification: row.classification,
        hours: String(row.hours),
        rate: String(row.rate),
      })),

      equipment: equipmentResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        unitNumber: row.unitNumber,
        hours: String(row.hours),
        rate: String(row.rate),
      })),

      materials: materialResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        unit: row.unit,
        quantity: String(row.quantity),
        price: String(row.price),
      })),

      invoices: invoiceResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        cost: String(row.cost),
        amount: String(row.cost),

        invoiceAttachment: row.attachmentId
          ? {
              id: row.attachmentId,
              file: null,
              fileName: row.fileName ?? "",
              fileType: row.fileType ?? "",
              previewUrl: `/api/attachments/${row.attachmentId}`,
            }
          : null,
      })),

      invoiceMarkups: markupResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        markup: String(row.markup),
      })),
    },
  };
}
