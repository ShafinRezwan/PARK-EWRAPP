// scripts/clearDB.ts
// Destructive development-only reset. Preserves User and Session records.
import { config } from "dotenv";
import { Pool } from "pg";
import path from "node:path";
import { unlink } from "node:fs/promises";

config({ path: ".env.local" });

function resolveAttachmentPath(root: string, pathname: string): string {
  if (!pathname || pathname.includes("\\") || pathname.includes("\0")) {
    throw new Error(`Unsafe attachment pathname: ${pathname}`);
  }
  const parts = pathname.split("/");
  if (
    parts.length < 3 ||
    parts[0] !== "ewr" ||
    parts.some((part) => !part || part === "." || part === "..") ||
    parts.some((part) => part.includes(":"))
  ) {
    throw new Error(`Unsafe attachment pathname: ${pathname}`);
  }
  const absolute = path.resolve(root, ...parts);
  const relative = path.relative(root, absolute);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Attachment path escapes upload directory: ${pathname}`);
  }
  return absolute;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This cleanup script cannot run in production.");
  }
  if (process.env.ALLOW_DATABASE_WIPE !== "YES") {
    throw new Error("Database wipe blocked. Set ALLOW_DATABASE_WIPE=YES to continue.");
  }
  if (process.env.CONFIRM_DATABASE_WIPE !== "DELETE_PROTOTYPE_DATA") {
    throw new Error("Set CONFIRM_DATABASE_WIPE=DELETE_PROTOTYPE_DATA to confirm.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  const uploadRoot = process.env.EWR_UPLOAD_DIR;
  if (!uploadRoot || !path.isAbsolute(uploadRoot)) {
    throw new Error("EWR_UPLOAD_DIR must be an absolute directory path.");
  }
  const root = path.resolve(uploadRoot);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  let inTransaction = false;
  let paths: string[] = [];
  let userCount = 0;

  try {
    await client.query("BEGIN");
    inTransaction = true;
    // Prevent concurrent application writes while collecting paths and wiping records.
    await client.query(`LOCK TABLE "Attachment", "Invoice", "EWRInvoiceRow",
      "EWRInvoiceMarkupRow", "EWRMaterialRow", "EWREquipmentRow", "EWRLabourRow",
      "ExtraWorkReport", "ToDoTask", "Job", "LabourRate", "EquipmentRate",
      "MaterialRate" IN SHARE ROW EXCLUSIVE MODE`);

    const attachmentResult = await client.query<{ pathname: string }>(
      'SELECT "pathname" FROM "Attachment"'
    );
    paths = [...new Set(attachmentResult.rows.map((row) => row.pathname).filter(Boolean))];
    // Validate all paths before modifying the database.
    paths.forEach((pathname) => resolveAttachmentPath(root, pathname));

    // Delete dependents first. Do not delete users or sessions.
    for (const table of [
      "Invoice", "Attachment", "EWRInvoiceRow", "EWRInvoiceMarkupRow",
      "EWRMaterialRow", "EWREquipmentRow", "EWRLabourRow", "ExtraWorkReport",
      "ToDoTask", "Job", "LabourRate", "EquipmentRate", "MaterialRate",
    ]) {
      // Only fixed, hard-coded table names are interpolated here.
      await client.query(`DELETE FROM "${table}"`);
    }

    const users = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM "User"'
    );
    userCount = Number(users.rows[0].count);
    await client.query("COMMIT");
    inTransaction = false;
  } catch (error) {
    if (inTransaction) await client.query("ROLLBACK").catch(console.error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  // Filesystem changes cannot participate in the PostgreSQL transaction.
  let failures = 0;
  for (const pathname of paths) {
    const absolute = resolveAttachmentPath(root, pathname);
    try {
      await unlink(absolute);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        failures++;
        console.error(`Could not remove attachment ${pathname}:`, error);
      }
    }
  }

  console.log("Prototype database data cleared. Users and sessions preserved.");
  console.log(`Users preserved: ${userCount}`);
  console.log(`Attachment paths processed: ${paths.length}`);
  if (failures) {
    throw new Error(`${failures} attachment file(s) could not be removed. Manual cleanup required.`);
  }
}

main().catch((error) => {
  console.error("Database clear failed:", error);
  process.exitCode = 1;
});
