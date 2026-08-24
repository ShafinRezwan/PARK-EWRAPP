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
  address: string;
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
    address: report.address ?? "",
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

  select: {
    id: true,
    ewrNumber: true,
    workDate: true,
    recipient: true,
    address: true,
    description: true,

    job: {
      select: {
        id: true,
        jobNumber: true,
        jobName: true,
      },
    },

    labourEntries: true,
    equipmentEntries: true,
    materialEntries: true,

    invoices: {
      include: {
        attachment: true,
      },
    },
  },
});

  if (!report) {
    return null;
  }

  return {
    id: report.id,
    ewrNumber: report.ewrNumber,

    formData: {
      jobId: report.job?.id ?? "",

      recipient: report.recipient ?? "",
      jobNumber: report.job?.jobNumber ?? "",
      jobName: report.job?.jobName ?? "",
      address: report.address ?? "",
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

      invoices: report.invoices.map((row) => {
        const attachment = row.attachment[0] ?? null;

        return {
          id: row.id,
          name: row.name,
          cost: String(row.cost),
          markup: String(row.markup),

          amount: String(
            Number(row.cost) +
              Number(row.cost) *
                (Number(row.markup) / 100),
          ),

          invoiceAttachment: attachment
            ? {
                id: attachment.id,
                file: null,
                fileName: attachment.fileName,
                fileType: attachment.fileType,
                previewUrl: `/api/attachments/${attachment.id}`,
              }
            : null,
        };
      }),
    },
  };
}