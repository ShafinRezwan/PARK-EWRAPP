import "dotenv/config";

import { prisma } from "../lib/prisma";

async function main() {

    if (process.env.NODE_ENV === "production") {
  throw new Error(
    "This cleanup script cannot run in production.",
  );
}
  console.log("Clearing all jobs...");

  // Make sure there are no EWRs still attached
  const reportCount =
    await prisma.extraWorkReport.count();

  if (reportCount > 0) {
    throw new Error(
      `Cannot clear jobs while ${reportCount} work report(s) still exist. Run clearWorkReports first.`,
    );
  }

  // Remove tasks linked to jobs if needed
  await prisma.toDoTask.deleteMany({
    where: {
      jobId: {
        not: null,
      },
    },
  });

  const result =
    await prisma.job.deleteMany();

  console.log(
    `Deleted ${result.count} jobs.`,
  );
}

main()
  .catch((error) => {
    console.error(
      "Unable to clear jobs:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });