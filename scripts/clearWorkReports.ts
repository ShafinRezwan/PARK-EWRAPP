import "dotenv/config";

import { del } from "@vercel/blob";

import { prisma } from "../lib/prisma";

async function main() {

    if (process.env.NODE_ENV === "production") {
  throw new Error(
    "This cleanup script cannot run in production.",
  );
}
  console.log("Clearing all work reports...");

  const token =
    process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not configured.",
    );
  }

  // -----------------------------------------
  // Find Blob files first
  // -----------------------------------------

  const attachments =
    await prisma.attachment.findMany({
      select: {
        pathname: true,
      },
    });

  // -----------------------------------------
  // Delete database records
  // -----------------------------------------

  const deletedReports =
    await prisma.$transaction(async (tx) => {
      await tx.attachment.deleteMany();

      await tx.eWRInvoiceRow.deleteMany();

      await tx.eWRLabourRow.deleteMany();

      await tx.eWREquipmentRow.deleteMany();

      await tx.eWRMaterialRow.deleteMany();

      return tx.extraWorkReport.deleteMany();
    });

  // -----------------------------------------
  // Delete Blob files
  // -----------------------------------------

  for (const attachment of attachments) {
    if (!attachment.pathname) {
      continue;
    }

    try {
      await del(
        attachment.pathname,
        {
          token,
        },
      );

      console.log(
        `Deleted Blob: ${attachment.pathname}`,
      );
    } catch (error) {
      console.error(
        `Unable to delete Blob ${attachment.pathname}:`,
        error,
      );
    }
  }

  console.log(
    `Deleted ${deletedReports.count} work reports.`,
  );

  console.log(
    `Processed ${attachments.length} attachment files.`,
  );
}

main()
  .catch((error) => {
    console.error(
      "Unable to clear work reports:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });