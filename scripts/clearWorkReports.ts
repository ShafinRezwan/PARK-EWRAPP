// scripts/clearWorkReports.ts
import { config } from "dotenv";
config({ path: ".env.local" });

import path from "node:path";
import { unlink } from "node:fs/promises";
import { Pool } from "pg";

// This is a destructive maintenance script. Never run against production.
async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This cleanup script cannot run in production.");
  }
  if (process.env.CONFIRM_CLEAR_REPORTS !== "DELETE_ALL_REPORTS") {
    throw new Error(
      'Refusing to delete reports. Set CONFIRM_CLEAR_REPORTS=DELETE_ALL_REPORTS explicitly.'
    );
  }

  const uploadRoot = process.env.EWR_UPLOAD_DIR;
  if (!uploadRoot || !path.isAbsolute(uploadRoot)) {
    throw new Error("EWR_UPLOAD_DIR must be an absolute directory path.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const root = path.resolve(uploadRoot);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  let inTransaction = false;
  let attachmentPaths: string[] = [];
  let deletedCount = 0;

  try {
    // Capture paths before the FK cascade removes Attachment records.
    await client.query("BEGIN");
    inTransaction = true;
    const attachments = await client.query<{ pathname: string }>(
      'SELECT "pathname" FROM "Attachment" WHERE "pathname" IS NOT NULL'
    );
    attachmentPaths = attachments.rows.map((row) => row.pathname);

    // All dependent EWR rows (including invoices, markups and attachments)
    // are removed by the ON DELETE CASCADE constraints in the SQL schema.
    const deleted = await client.query('DELETE FROM "ExtraWorkReport"');
    deletedCount = deleted.rowCount ?? 0;
    await client.query("COMMIT");
    inTransaction = false;
  } catch (error) {
    if (inTransaction) await client.query("ROLLBACK").catch(console.error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  // Only delete paths beneath the configured upload directory. Never accept
  // absolute, parent-traversal, or unexpected attachment paths from the DB.
  let deletedFiles = 0;
  let failedFiles = 0;
  for (const pathname of new Set(attachmentPaths)) {
    if (!pathname || pathname.includes("\\") || path.posix.isAbsolute(pathname)) {
      console.error("Skipping unsafe attachment path:", pathname);
      failedFiles++;
      continue;
    }
    const parts = pathname.split("/");
    if (parts[0] !== "ewr" || parts.some((part) => !part || part === "." || part === "..")) {
      console.error("Skipping unsafe attachment path:", pathname);
      failedFiles++;
      continue;
    }
    const absolutePath = path.resolve(root, ...parts);
    if (!absolutePath.startsWith(root + path.sep)) {
      console.error("Skipping attachment outside upload root:", pathname);
      failedFiles++;
      continue;
    }
    try {
      await unlink(absolutePath);
      deletedFiles++;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("Could not remove attachment:", pathname, error);
        failedFiles++;
      }
    }
  }

  console.log(`Deleted ${deletedCount} work reports.`);
  console.log(`Deleted ${deletedFiles} local attachment files.`);
  if (failedFiles) {
    console.error(`${failedFiles} attachment files require manual review.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unable to clear work reports:", error);
  process.exitCode = 1;
});
