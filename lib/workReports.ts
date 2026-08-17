// lib/workReports.ts

import { prisma } from "@/lib/prisma";
import type {
  EWRFormData,
} from "@/types/ewr.types";


export type WorkReports = {
  id: string;
  jobNumber: string;
  jobName: string;
  ewrNumber: string;
  dateOfWork: string;
   status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "NEEDS_REVISION"
    | "APPROVED"
    | "SENT";
  divisionCode: string;
  year: string;
};

export async function getWorkReports(): Promise<WorkReports[]> {
  const reports = await prisma.extraWorkReport.findMany({
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reports.map((report) => ({
    id: report.id,
    jobNumber: report.job?.jobNumber ?? "",
    jobName: report.job?.jobName ?? "",
    ewrNumber: report.ewrNumber,
    dateOfWork: report.workDate.toISOString(),
    status: report.status,
    divisionCode: report.job?.division ?? "",
    year: String(report.job?.year ?? ""),
  }));
}


export type ExistingWorkReport = {
  id: string;
  ewrNumber: string;
  formData: EWRFormData;
};

export async function getWorkReportById(
  id: string,
): Promise<ExistingWorkReport | null> {
  const report = await prisma.extraWorkReport.findUnique({
    where: {
      id,
    },
    include: {
      job: true,
      labourEntries: true,
      equipmentEntries: true,
      materialEntries: true,
      invoices: true,
    },
  });

  if (!report) {
    return null;
  }

  return {
    id: report.id,
    ewrNumber: report.ewrNumber,

    formData: {
      recipient: report.recipient ?? "",
      jobNumber: report.job?.jobNumber ?? "",
      jobName: report.job?.jobName ?? "",
      date: report.workDate.toISOString().split("T")[0],
      description: report.description,
      ewrNumber: report.ewrNumber ?? "",

      labour: report.labourEntries.map((row) => ({
        id: row.id,
        classification: row.classification,
        hours: String(row.hours),
        rate: String(row.rate),
      })),

      equipment: report.equipmentEntries.map((row) => ({
        id: row.id,
        name: row.name,
        unitNumber: row.unitNumber,
        hours: String(row.hours),
        rate: String(row.rate),
      })),

      materials: report.materialEntries.map((row) => ({
        id: row.id,
        name: row.name,
        unit: row.unit,
        quantity: String(row.quantity),
        price: String(row.price),
      })),

      invoices: report.invoices.map((row) => ({
        id: row.id,
        name: row.name,
        cost: String(row.cost),
        markup: String(row.markup),

        // Calculate this since your Prisma EWRInvoiceRow
        // doesn't currently store amount
        amount: String(
          Number(row.cost) +
            Number(row.cost) * (Number(row.markup) / 100),
        ),

        invoiceAttachment: null,
      })),
    },
  };
}