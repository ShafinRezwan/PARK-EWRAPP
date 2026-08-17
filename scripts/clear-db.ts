// scripts/clear-prototype-data.ts

import { prisma } from "../lib/prisma";

async function main() {
  if (process.env.ALLOW_DATABASE_WIPE !== "YES") {
    throw new Error(
      "Database wipe blocked. Set ALLOW_DATABASE_WIPE=YES to continue.",
    );
  }

  console.log("Clearing prototype data...");

  await prisma.$transaction(async (tx) => {
    // Delete attachments/invoice data first
    await tx.attachment.deleteMany();
    await tx.invoice.deleteMany();

    // Delete EWR rows
    await tx.eWRInvoiceRow.deleteMany();
    await tx.eWRMaterialRow.deleteMany();
    await tx.eWREquipmentRow.deleteMany();
    await tx.eWRLabourRow.deleteMany();

    // Delete EWRs
    await tx.extraWorkReport.deleteMany();

    // Delete tasks before jobs
    await tx.toDoTask.deleteMany();

    // Delete jobs
    await tx.job.deleteMany();

    // Delete rate tables
    await tx.labourRate.deleteMany();
    await tx.equipmentRate.deleteMany();
    await tx.materialRate.deleteMany();

    // DO NOT delete users
  });

  const remainingUsers = await prisma.user.count();

  console.log("Database cleared successfully.");
  console.log(`Users preserved: ${remainingUsers}`);
}

main()
  .catch((error) => {
    console.error("Database clear failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });