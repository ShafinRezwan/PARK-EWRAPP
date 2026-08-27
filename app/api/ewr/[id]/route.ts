import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

import { prisma } from "@/lib/prisma";

import type {
  LabourFormRow,
  EquipmentFormRow,
  MaterialFormRow,
  InvoiceFormRow,
  InvoiceMarkupRow,
} from "@/types/ewr.types";

type InvoiceSaveRow = Omit<
  InvoiceFormRow,
  "invoiceAttachment"
> & {
  hasAttachment?: boolean;
};

type UpdateEWRBody = {
  jobNumber: string;
  jobId: string;
  ewrNumber: string;
  recipient?: string;
  address ?: string;
  date: string;
  description?: string;

  labour?: LabourFormRow[];
  equipment?: EquipmentFormRow[];
  materials?: MaterialFormRow[];
  invoices?: InvoiceSaveRow[];
  invoiceMarkups?: InvoiceMarkupRow[];
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

    // -----------------------------------------
    // Get request body
    // -----------------------------------------

    const body =
      (await request.json()) as UpdateEWRBody;

    const {
      jobId,
      jobNumber,
      recipient,
      ewrNumber,
      address,
      date,
      description,
      labour = [],
      equipment = [],
      materials = [],
      invoices = [],
      invoiceMarkups = [],
    } = body;

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (!jobNumber?.trim()) {
      return NextResponse.json(
        {
          error: "Job number is required.",
        },
        {
          status: 400,
        },
      );
    }

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
    // Make sure EWR exists
    // -----------------------------------------

    const existingReport =
      await prisma.extraWorkReport.findUnique({
        where: {
          id,
        },
      });

    if (!existingReport) {
      return NextResponse.json(
        {
          error: "EWR could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------------------
    // Find selected Job
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

    const finalEwrNumber = ewrNumber?.trim();

  // -----------------------------------------
  // Validate EWR number
  // -----------------------------------------

  if (!finalEwrNumber) {
    return NextResponse.json(
      {
        error: "EWR number is required.",
      },
      {
        status: 400,
      },
    );
  }

  const numericEwrNumber = Number(finalEwrNumber);

  if (
    !Number.isInteger(numericEwrNumber) ||
    numericEwrNumber < 9801
  ) {
    return NextResponse.json(
      {
        error: "EWR number must be 9801 or greater.",
      },
      {
        status: 400,
      },
    );
  }

  // -----------------------------------------
  // Check for duplicate EWR number
  // -----------------------------------------

  const duplicateReport =
    await prisma.extraWorkReport.findFirst({
      where: {
        jobId: job.id,
        ewrNumber: finalEwrNumber,

        NOT: {
          id,
        },
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
      .filter(
        (row) =>
          row.classification.trim() !== "" ||
          row.hours !== "" ||
          row.rate !== "",
      )
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
      .filter(
        (row) =>
          row.name.trim() !== "" ||
          row.unitNumber.trim() !== "" ||
          row.hours !== "" ||
          row.rate !== "",
      )
      .map((row) => {
        const hours =
          Number(row.hours) || 0;

        const rate =
          Number(row.rate) || 0;

        return {
          name: row.name.trim(),

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
      .filter(
        (row) =>
          row.name.trim() !== "" ||
          row.unit.trim() !== "" ||
          row.quantity !== "" ||
          row.price !== "",
      )
      .map((row) => {
        const quantity =
          Number(row.quantity) || 0;

        const price =
          Number(row.price) || 0;

        return {
          name: row.name.trim(),
          unit: row.unit.trim(),

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
      row.cost !== "" ||
      row.hasAttachment === true
    );
  })
  .map((row) => {
    return {
      id: row.id,
      name: row.name.trim(),
      cost: Number(row.cost) || 0,
      hasAttachment: row.hasAttachment === true,
    };
  });


  const invoiceMarkupRows = invoiceMarkups
   .filter((row) => row.name.trim() !== "" || row.markup !== "")
  .map((row) => ({
    id: row.id,
    name: row.name.trim(),
    markup: Number(row.markup) || 0,
  }));

    // -----------------------------------------
    // IDs of invoices still in the form
    // -----------------------------------------

    const incomingInvoiceIds =
      invoiceRows.map(
        (invoice) => invoice.id,
      );

    // Store Blob pathnames that need to be
    // deleted AFTER the DB transaction succeeds.
    const removedBlobPathnames: string[] = [];

    // -----------------------------------------
    // Update everything in one DB transaction
    // -----------------------------------------

    const updatedReport =
      await prisma.$transaction(
        async (tx) => {
          // -------------------------------------
          // Delete/rebuild labour
          // -------------------------------------

          await tx.eWRLabourRow.deleteMany({
            where: {
              reportId: id,
            },
          });

          // -------------------------------------
          // Delete/rebuild equipment
          // -------------------------------------

          await tx.eWREquipmentRow.deleteMany({
            where: {
              reportId: id,
            },
          });

          // -------------------------------------
          // Delete/rebuild materials
          // -------------------------------------

          await tx.eWRMaterialRow.deleteMany({
            where: {
              reportId: id,
            },
          });

          
          // -------------------------------------
          // Delete/rebuild invoice markups
          // -------------------------------------

          await tx.eWRInvoiceMarkupRow.deleteMany({
            where: {
              reportId: id,
            },
          });

          // existing invoice removal / attachment logic...

          for (const invoice of invoiceRows) {
            await tx.eWRInvoiceRow.upsert({
              where: {
                id: invoice.id,
              },

              update: {
                name: invoice.name,
                cost: invoice.cost,
                reportId: id,
              },

              create: {
                id: invoice.id,
                name: invoice.name,
                cost: invoice.cost,
                reportId: id,
              },
            });
          }

          if (invoiceMarkupRows.length > 0) {
            await tx.eWRInvoiceMarkupRow.createMany({
              data: invoiceMarkupRows.map((row) => ({
                id: row.id,
                name: row.name,
                markup: row.markup,
                reportId: id,
              })),
            });
          }


          // -------------------------------------
          // Find invoices removed from this EWR
          // -------------------------------------

          const removedInvoices =
            await tx.eWRInvoiceRow.findMany({
              where: {
                reportId: id,

                id: {
                  notIn:
                    incomingInvoiceIds,
                },
              },

              include: {
                attachment: true,
              },
            });

          // -------------------------------------
          // Remember their Blob files
          // -------------------------------------

          for (const invoice of removedInvoices) {
  const attachment = invoice.attachment[0];

  if (attachment?.pathname) {
    removedBlobPathnames.push(
      attachment.pathname,
    );
  }
}

          // -------------------------------------
          // Delete removed invoice DB rows
          // -------------------------------------

          await tx.eWRInvoiceRow.deleteMany({
            where: {
              reportId: id,

              id: {
                notIn:
                  incomingInvoiceIds,
              },
            },
          });

          // -------------------------------------
// Find attachments manually removed
// from invoices that still exist
// -------------------------------------

const invoicesWithRemovedAttachments =
  invoiceRows.filter(
    (invoice) => !invoice.hasAttachment,
  );

for (const invoice of invoicesWithRemovedAttachments) {
  const existingAttachments =
    await tx.attachment.findMany({
      where: {
        invoiceId: invoice.id,
        reportId: id,
      },
    });

  // Remember Blob files for deletion
  // after the transaction succeeds.
  for (const attachment of existingAttachments) {
    if (attachment.pathname) {
      removedBlobPathnames.push(
        attachment.pathname,
      );
    }
  }

  // Delete attachment metadata from Prisma
  await tx.attachment.deleteMany({
    where: {
      invoiceId: invoice.id,
      reportId: id,
    },
  });
}

          // -------------------------------------
          // Upsert invoices still in the form
          // -------------------------------------

          for (
            const invoice of invoiceRows
          ) {
            await tx.eWRInvoiceRow.upsert({
              where: {
                id: invoice.id,
              },

              update: {
                name:
                  invoice.name,

                cost:
                  invoice.cost,

              
                reportId: id,
              },

              create: {
                id:
                  invoice.id,

                name:
                  invoice.name,

                cost:
                  invoice.cost,


                reportId: id,
              },
            });
          }

          // -------------------------------------
          // Update main EWR
          // -------------------------------------

          return tx.extraWorkReport.update({
            where: {
              id,
            },

            data: {
              jobId:
                job.id,
              
              ewrNumber: finalEwrNumber,

              workDate:
                new Date(
                  `${date}T00:00:00`,
                ),

              recipient:
                recipient?.trim() ||
                null,                

              address:
                address?.trim() || null,

              description:
                description?.trim() ||
                "",

              labourEntries: {
                create:
                  labourRows,
              },

              equipmentEntries: {
                create:
                  equipmentRows,
              },

              materialEntries: {
                create:
                  materialRows,
              },
            },

            include: {
              invoices: true,
            },
          });
        },
      );

    // -----------------------------------------
    // Delete removed attachments from Blob
    //
    // Do this AFTER the DB transaction.
    // -----------------------------------------

    if (
      removedBlobPathnames.length > 0
    ) {
      const blobToken =
        process.env
          .BLOB_READ_WRITE_TOKEN;

      if (!blobToken) {
        console.error(
          "BLOB_READ_WRITE_TOKEN is not configured. Invoice DB records were removed, but Blob cleanup could not run.",
        );
      } else {
        for (
          const pathname of removedBlobPathnames
        ) {
          try {
            await del(
              pathname,
              {
                token:
                  blobToken,
              },
            );

            console.log(
              "DELETED BLOB:",
              pathname,
            );
          } catch (error) {
            console.error(
              `Unable to delete Blob ${pathname}:`,
              error,
            );
          }
        }
      }
    }

    // -----------------------------------------
    // Success
    // -----------------------------------------

    return NextResponse.json({
      message:
        `${job.jobName} - EWR ${updatedReport.ewrNumber} updated successfully.`,

      report: {
        id:
          updatedReport.id,

        ewrNumber:
          updatedReport.ewrNumber,

        invoices:
          updatedReport.invoices.map(
            (invoice) => ({
              id:
                invoice.id,

              name:
                invoice.name,
            }),
          ),
      },
    });
  } catch (error) {
    console.error(
      "UPDATE EWR ERROR:",
      error,
    );

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

export async function DELETE(
  request: Request,
  { params }: Props,
) {
  try {
    const { id } = await params;

    // -----------------------------------------
    // Find report
    // -----------------------------------------

    const report = await prisma.extraWorkReport.findUnique({
      where: {
        id,
      },
      include: {
        attachments: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        {
          error: "Work report could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------------------
    // Save Blob paths before DB deletion
    // -----------------------------------------

    const blobPathnames = report.attachments
      .map((attachment) => attachment.pathname)
      .filter(
        (pathname): pathname is string =>
          Boolean(pathname),
      );

    // -----------------------------------------
    // Delete report
    // -----------------------------------------

    await prisma.extraWorkReport.delete({
      where: {
        id,
      },
    });

    // -----------------------------------------
    // Delete Blob files
    // -----------------------------------------

    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      for (const pathname of blobPathnames) {
        try {
          await del(pathname, {
            token: blobToken,
          });
        } catch (error) {
          console.error(
            `Unable to delete Blob ${pathname}:`,
            error,
          );
        }
      }
    }

    // -----------------------------------------
    // Success
    // -----------------------------------------

    return NextResponse.json({
      message: `EWR ${report.ewrNumber} deleted successfully.`,
    });
  } catch (error) {
    console.error("DELETE EWR ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete work report.",
      },
      {
        status: 500,
      },
    );
  }
}