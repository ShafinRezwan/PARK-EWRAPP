// app/api/ewr/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import type {
  LabourFormRow,
  EquipmentFormRow,
  MaterialFormRow,
  InvoiceFormRow,
  InvoiceMarkupRow,
} from "@/types/ewr.types";

export const runtime = "nodejs";

// We don't send invoiceAttachment through JSON
type InvoiceSaveRow = Omit<
  InvoiceFormRow,
  "invoiceAttachment"
>;

type CreateEWRBody = {
  jobId: string;
  jobNumber: string;
  recipient?: string;
  date: string;
  description?: string;
  address?: string;
  ewrNumber?: string;

  labour?: LabourFormRow[];
  equipment?: EquipmentFormRow[];
  materials?: MaterialFormRow[];
  invoices?: InvoiceSaveRow[];

  invoiceMarkups?: InvoiceMarkupRow[];
};

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // Get request data
    // -----------------------------------------

    const body =
      (await request.json()) as CreateEWRBody;

    const {
      jobNumber,
      jobId,
      ewrNumber,
      recipient,
      address,
      date,
      description,
      labour = [],
      equipment = [],
      materials = [],
      invoices = [],
      invoiceMarkups = [],
    } = body;

    console.log("EWR BODY RECEIVED:", body);

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (!jobId?.trim()) {
      return NextResponse.json(
        {
          error: "Job is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          error: "Work date is required.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------
    // Find job
    // -----------------------------------------

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: `Job ${jobNumber} could not be found.`,
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------------------
    // Generate EWR number for THIS job
    // -----------------------------------------

    const reportsForJob =
      await prisma.extraWorkReport.findMany({
        where: {
          jobId: job.id,
        },

        select: {
          ewrNumber: true,
        },
      });

    const usedNumbers = reportsForJob
      .map((report) =>
        Number(report.ewrNumber),
      )
      .filter((number) =>
        Number.isFinite(number),
      );

    const nextEwrNumber =
      usedNumbers.length === 0
        ? 9801
        : Math.max(...usedNumbers) + 1;

    const finalEwrNumber =
      ewrNumber?.trim() ||
      String(nextEwrNumber);

    // -----------------------------------------
    // Validate EWR number
    // -----------------------------------------

    const numericEwrNumber =
      Number(finalEwrNumber);

    if (
      !Number.isInteger(numericEwrNumber) ||
      numericEwrNumber < 9801
    ) {
      return NextResponse.json(
        {
          error:
            "EWR number must be 9801 or greater.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------
    // Duplicate EWR check
    // -----------------------------------------

    const duplicateReport =
      await prisma.extraWorkReport.findFirst({
        where: {
          jobId: job.id,
          ewrNumber: finalEwrNumber,
        },
      });

    if (duplicateReport) {
      return NextResponse.json(
        {
          error: `EWR #${finalEwrNumber} already exists for Job ${job.jobNumber}.`,
        },
        {
          status: 409,
        },
      );
    }

    // -----------------------------------------
    // Labour
    // -----------------------------------------

    const labourRows = labour
      .filter((row) => {
        return (
          row.classification.trim() !== "" ||
          row.hours !== "" ||
          row.rate !== ""
        );
      })
      .map((row) => {
        const hours =
          Number(row.hours) || 0;

        const rate =
          Number(row.rate) || 0;

        return {
          classification:
            row.classification.trim(),

          hours,
          rate,

          amount:
            hours * rate,
        };
      });

    // -----------------------------------------
    // Equipment
    // -----------------------------------------

    const equipmentRows = equipment
      .filter((row) => {
        return (
          row.name.trim() !== "" ||
          row.unitNumber.trim() !== "" ||
          row.hours !== "" ||
          row.rate !== ""
        );
      })
      .map((row) => {
        const hours =
          Number(row.hours) || 0;

        const rate =
          Number(row.rate) || 0;

        return {
          name:
            row.name.trim(),

          unitNumber:
            row.unitNumber.trim(),

          hours,
          rate,

          amount:
            hours * rate,
        };
      });

    // -----------------------------------------
    // Materials
    // -----------------------------------------

    const materialRows = materials
      .filter((row) => {
        return (
          row.name.trim() !== "" ||
          row.unit.trim() !== "" ||
          row.quantity !== "" ||
          row.price !== ""
        );
      })
      .map((row) => {
        const quantity =
          Number(row.quantity) || 0;

        const price =
          Number(row.price) || 0;

        return {
          name:
            row.name.trim(),

          unit:
            row.unit.trim(),

          quantity,
          price,

          amount:
            quantity * price,
        };
      });

    // -----------------------------------------
    // Invoices
    // -----------------------------------------

    const invoiceRows = invoices
      .filter((row) => {
        return (
          row.name.trim() !== "" ||
          row.cost !== ""
        );
      })
      .map((row) => {
        return {
          id: row.id,

          name:
            row.name.trim(),

          cost:
            Number(row.cost) || 0,
        };
      });

    // -----------------------------------------
    // Invoice markups
    // -----------------------------------------

    const invoiceMarkupRows =
      invoiceMarkups
        .filter((row) => {
          return (
            row.name.trim() !== "" ||
            row.markup !== ""
          );
        })
        .map((row) => {
          return {
            id: row.id,

            name:
              row.name.trim(),

            markup:
              Number(row.markup) || 0,
          };
        });

    // -----------------------------------------
    // Debugging
    // -----------------------------------------

    console.log(
      "LABOUR TO SAVE:",
      labourRows,
    );

    console.log(
      "EQUIPMENT TO SAVE:",
      equipmentRows,
    );

    console.log(
      "MATERIALS TO SAVE:",
      materialRows,
    );

    console.log(
      "INVOICES TO SAVE:",
      invoiceRows,
    );

    console.log(
      "INVOICE MARKUPS TO SAVE:",
      invoiceMarkupRows,
    );

    // -----------------------------------------
    // Create EWR
    // -----------------------------------------

    const report =
      await prisma.extraWorkReport.create({
        data: {
          ewrNumber:
            finalEwrNumber,

          workDate:
            new Date(
              `${date}T00:00:00`,
            ),

          recipient:
            recipient &&
            recipient.trim() !== ""
              ? recipient.trim()
              : null,

          address:
            address?.trim() || null,

          description:
            description?.trim() ?? "",

          status: "DRAFT",

          job: {
            connect: {
              id: job.id,
            },
          },

          labourEntries: {
            create: labourRows,
          },

          equipmentEntries: {
            create: equipmentRows,
          },

          materialEntries: {
            create: materialRows,
          },

          invoices: {
            create: invoiceRows,
          },

          invoiceMarkups: {
            create:
              invoiceMarkupRows,
          },
        },

        include: {
          invoices: true,
          invoiceMarkups: true,
        },
      });

    console.log(
      "EWR SAVED:",
      report.id,
    );

    // -----------------------------------------
    // Success
    // -----------------------------------------

    return NextResponse.json(
      {
        message:
          `EWR ${report.ewrNumber} saved successfully.`,

        report: {
          id:
            report.id,

          ewrNumber:
            report.ewrNumber,

          recipient:
            report.recipient,

          workDate:
            report.workDate,

          description:
            report.description,

          address:
            report.address,

          status:
            report.status,

          invoices:
            report.invoices.map(
              (invoice) => ({
                id:
                  invoice.id,

                name:
                  invoice.name,
              }),
            ),

          invoiceMarkups:
            report.invoiceMarkups.map(
              (markup) => ({
                id:
                  markup.id,

                name:
                  markup.name,

                markup:
                  String(
                    markup.markup,
                  ),
              }),
            ),
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "SAVE EWR ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save the EWR.",
      },
      {
        status: 500,
      },
    );
  }
}