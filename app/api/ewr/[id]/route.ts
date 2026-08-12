import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import type {
  LabourFormRow,
  EquipmentFormRow,
  MaterialFormRow,
  InvoiceFormRow,
} from "@/types/ewr.types";

type InvoiceSaveRow = Omit<InvoiceFormRow, "invoiceAttachment">;

type UpdateEWRBody = {
  jobNumber: string;
  recipient?: string;
  date: string;
  description?: string;
  labour?: LabourFormRow[];
  equipment?: EquipmentFormRow[];
  materials?: MaterialFormRow[];
  invoices?: InvoiceSaveRow[];
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: Props,
) {
  try {
    const { id } = await params;

    const body = (await request.json()) as UpdateEWRBody;

    const {
      jobNumber,
      recipient,
      date,
      description,
      labour = [],
      equipment = [],
      materials = [],
      invoices = [],
    } = body;

    if (!jobNumber?.trim()) {
      return NextResponse.json(
        { error: "Job number is required." },
        { status: 400 },
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Work date is required." },
        { status: 400 },
      );
    }

    const existingReport =
      await prisma.extraWorkReport.findUnique({
        where: {
          id,
        },
      });

    if (!existingReport) {
      return NextResponse.json(
        { error: "EWR could not be found." },
        { status: 404 },
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        jobNumber: jobNumber.trim(),
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: `Job ${jobNumber} could not be found.`,
        },
        { status: 404 },
      );
    }

    const labourRows = labour
      .filter(
        (row) =>
          row.classification.trim() !== "" ||
          row.hours !== "" ||
          row.rate !== "",
      )
      .map((row) => {
        const hours = Number(row.hours) || 0;
        const rate = Number(row.rate) || 0;

        return {
          classification: row.classification.trim(),
          hours,
          rate,
          amount: hours * rate,
        };
      });

    const equipmentRows = equipment
      .filter(
        (row) =>
          row.name.trim() !== "" ||
          row.unitNumber.trim() !== "" ||
          row.hours !== "" ||
          row.rate !== "",
      )
      .map((row) => {
        const hours = Number(row.hours) || 0;
        const rate = Number(row.rate) || 0;

        return {
          name: row.name.trim(),
          unitNumber: row.unitNumber.trim(),
          hours,
          rate,
          amount: hours * rate,
        };
      });

    const materialRows = materials
      .filter(
        (row) =>
          row.name.trim() !== "" ||
          row.unit.trim() !== "" ||
          row.quantity !== "" ||
          row.price !== "",
      )
      .map((row) => {
        const quantity = Number(row.quantity) || 0;
        const price = Number(row.price) || 0;

        return {
          name: row.name.trim(),
          unit: row.unit.trim(),
          quantity,
          price,
          amount: quantity * price,
        };
      });

    const invoiceRows = invoices
      .filter(
        (row) =>
          row.name.trim() !== "" ||
          row.cost !== "",
      )
      .map((row) => ({
        name: row.name.trim(),
        cost: Number(row.cost) || 0,
        markup: Number(row.markup) || 0,
      }));

    const updatedReport =
      await prisma.$transaction(async (tx) => {
        // Delete currently saved child rows
        await tx.eWRLabourRow.deleteMany({
          where: {
            reportId: id,
          },
        });

        await tx.eWREquipmentRow.deleteMany({
          where: {
            reportId: id,
          },
        });

        await tx.eWRMaterialRow.deleteMany({
          where: {
            reportId: id,
          },
        });

        await tx.eWRInvoiceRow.deleteMany({
          where: {
            reportId: id,
          },
        });

        // Update the existing report
        return tx.extraWorkReport.update({
          where: {
            id,
          },

          data: {
            jobId: job.id,

            workDate: new Date(
              `${date}T00:00:00`,
            ),

            recipient:
              recipient?.trim() || null,

            description:
              description?.trim() || "",

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
          },
        });
      });

    return NextResponse.json({
      message: `EWR ${updatedReport.ewrNumber} updated successfully.`,

      report: {
        id: updatedReport.id,
        ewrNumber: updatedReport.ewrNumber,
      },
    });
  } catch (error) {
    console.error("UPDATE EWR ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update EWR.",
      },
      {
        status: 500,
      },
    );
  }
}