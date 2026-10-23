
import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env.local" });

//CLEAR_JOBS_CONFIRM=DELETE_ALL_JOBS npm run clear:jobs
async function main() {
  // Never allow this script to run in production.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "This cleanup script cannot run in production."
    );
  }

  // Require explicit confirmation.
  if (
    process.env.CLEAR_JOBS_CONFIRM !== "DELETE_ALL_JOBS"
  ) {
    throw new Error(
      "Deletion cancelled. Set CLEAR_JOBS_CONFIRM=DELETE_ALL_JOBS to confirm."
    );
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();
  let inTransaction = false;

  try {
    console.log("Checking database before clearing jobs...");

    await client.query("BEGIN");
    inTransaction = true;

    // Prevent concurrent changes to the affected tables
    // while checking and deleting jobs.
    await client.query(
      'LOCK TABLE "ExtraWorkReport", "Job", "ToDoTask" IN SHARE ROW EXCLUSIVE MODE'
    );

    // Do not delete jobs while EWRs exist.
    const reportResult = await client.query<{
      count: string;
    }>(
      'SELECT COUNT(*)::text AS count FROM "ExtraWorkReport"'
    );

    const reportCount = Number(
      reportResult.rows[0].count
    );

    if (reportCount > 0) {
      throw new Error(
        `Cannot clear jobs while ${reportCount} work report(s) still exist. Clear work reports first.`
      );
    }

    // Delete tasks linked to jobs.
    const deletedTasks = await client.query(
      'DELETE FROM "ToDoTask" WHERE "jobId" IS NOT NULL'
    );

    // Delete all jobs.
    const deletedJobs = await client.query(
      'DELETE FROM "Job"'
    );

    await client.query("COMMIT");
    inTransaction = false;

    console.log(
      `Deleted ${deletedTasks.rowCount ?? 0} job-related tasks.`
    );

    console.log(
      `Deleted ${deletedJobs.rowCount ?? 0} jobs.`
    );

    console.log("Job cleanup completed successfully.");
  } catch (error) {
    if (inTransaction) {
      await client.query("ROLLBACK");
    }

    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Unable to clear jobs:", error);
  process.exitCode = 1;
});
