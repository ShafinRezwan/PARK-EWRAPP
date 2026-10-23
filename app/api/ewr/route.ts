// Replace app/api/ewr/route.ts with this file.
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type {
  LabourFormRow,
  EquipmentFormRow,
  MaterialFormRow,
  InvoiceFormRow,
  InvoiceMarkupRow,
} from "@/types/ewr.types";

export const runtime = "nodejs";

type InvoiceSaveRow = Omit<InvoiceFormRow, "invoiceAttachment"> & {
  hasAttachment?: boolean;
};

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

type SavedInvoice = { id: string; name: string };
type SavedMarkup = { id: string; name: string; markup: string };

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function numeric(value: unknown): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

export async function POST(request: Request) {
  let client;
  let transactionStarted = false;

  try {
    const body = (await request.json()) as CreateEWRBody;
    const {
      jobId,
      jobNumber,
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

    if (typeof jobId !== "string" || !jobId.trim()) {
      return badRequest("Job is required.");
    }
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return badRequest("A valid work date is required (YYYY-MM-DD).");
    }
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() !== Number(date.slice(0, 4)) || parsedDate.getMonth() + 1 !== Number(date.slice(5, 7)) || parsedDate.getDate() !== Number(date.slice(8, 10))) {
      return badRequest("Work date is invalid.");
    }
    if (![labour, equipment, materials, invoices, invoiceMarkups].every(Array.isArray)) {
      return badRequest("Invalid EWR row data.");
    }

    const labourRows = labour
      .filter((row) => row.classification.trim() !== "" || row.hours !== "" || row.rate !== "")
      .map((row) => ({
        classification: row.classification.trim(),
        hours: numeric(row.hours),
        rate: numeric(row.rate),
        amount: numeric(row.hours) * numeric(row.rate),
      }));

    const equipmentRows = equipment
      .filter((row) => row.name.trim() !== "" || row.unitNumber.trim() !== "" || row.hours !== "" || row.rate !== "")
      .map((row) => ({
        name: row.name.trim(),
        unitNumber: row.unitNumber.trim(),
        hours: numeric(row.hours),
        rate: numeric(row.rate),
        amount: numeric(row.hours) * numeric(row.rate),
      }));

    const materialRows = materials
      .filter((row) => row.name.trim() !== "" || row.unit.trim() !== "" || row.quantity !== "" || row.price !== "")
      .map((row) => ({
        name: row.name.trim(),
        unit: row.unit.trim(),
        quantity: numeric(row.quantity),
        price: numeric(row.price),
        amount: numeric(row.quantity) * numeric(row.price),
      }));

    const invoiceRows = invoices
      .filter((row) => row.name.trim() !== "" || row.cost !== "" || row.hasAttachment === true)
      .map((row) => ({
        id: row.id || randomUUID(),
        name: row.name.trim(),
        cost: numeric(row.cost),
      }));

    const markupRows = invoiceMarkups
      .filter((row) => row.name.trim() !== "" || row.markup !== "")
      .map((row) => ({
        id: row.id || randomUUID(),
        name: row.name.trim(),
        markup: numeric(row.markup),
      }));

    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    // Serializes EWR creation for the same job, preventing concurrent auto-number collisions.
    const jobResult = await client.query<{ id: string; jobNumber: string }>(
      'SELECT "id", "jobNumber" FROM "Job" WHERE "id" = $1 FOR UPDATE',
      [jobId.trim()],
    );
    const job = jobResult.rows[0];
    if (!job) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return badRequest(`Job ${jobNumber ?? ""} could not be found.`, 404);
    }

    const numberResult = await client.query<{ ewrNumber: string }>(
      'SELECT "ewrNumber" FROM "ExtraWorkReport" WHERE "jobId" = $1',
      [job.id],
    );
    const usedNumbers = numberResult.rows
      .map((row) => Number(row.ewrNumber))
      .filter((number) => Number.isFinite(number));
    const nextNumber = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 9801;
    const finalEwrNumber = ewrNumber?.trim() || String(nextNumber);
    const parsedNumber = Number(finalEwrNumber);
    if (!Number.isInteger(parsedNumber) || parsedNumber < 9801) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return badRequest("EWR number must be 9801 or greater.");
    }

    const duplicate = await client.query(
      'SELECT 1 FROM "ExtraWorkReport" WHERE "jobId" = $1 AND "ewrNumber" = $2 LIMIT 1',
      [job.id, finalEwrNumber],
    );
    if (duplicate.rowCount) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return badRequest(`EWR #${finalEwrNumber} already exists for Job ${job.jobNumber}.`, 409);
    }

    const reportId = randomUUID();
    const savedReport = await client.query<{
      id: string;
      ewrNumber: string;
      recipient: string | null;
      workDate: Date;
      description: string;
      address: string | null;
      status: string;
    }>(
      `INSERT INTO "ExtraWorkReport"
        ("id", "ewrNumber", "workDate", "jobId", "recipient", "address", "description", "status")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT'::"ReportStatus")
       RETURNING "id", "ewrNumber", "recipient", "workDate", "description", "address", "status"`,
      [reportId, finalEwrNumber, parsedDate, job.id, recipient?.trim() || null, address?.trim() || null, description?.trim() ?? ""],
    );

    for (const row of labourRows) {
      await client.query(
        `INSERT INTO "EWRLabourRow"
          ("id", "classification", "hours", "rate", "amount", "reportId")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), row.classification, row.hours, row.rate, row.amount, reportId],
      );
    }
    for (const row of equipmentRows) {
      await client.query(
        `INSERT INTO "EWREquipmentRow"
          ("id", "name", "unitNumber", "hours", "rate", "amount", "reportId")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [randomUUID(), row.name, row.unitNumber, row.hours, row.rate, row.amount, reportId],
      );
    }
    for (const row of materialRows) {
      await client.query(
        `INSERT INTO "EWRMaterialRow"
          ("id", "name", "unit", "quantity", "price", "amount", "reportId")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [randomUUID(), row.name, row.unit, row.quantity, row.price, row.amount, reportId],
      );
    }

    const savedInvoices: SavedInvoice[] = [];
    for (const row of invoiceRows) {
      const result = await client.query<SavedInvoice>(
        `INSERT INTO "EWRInvoiceRow" ("id", "name", "cost", "reportId")
         VALUES ($1, $2, $3, $4) RETURNING "id", "name"`,
        [row.id, row.name, row.cost, reportId],
      );
      savedInvoices.push(result.rows[0]);
    }

    const savedMarkups: SavedMarkup[] = [];
    for (const row of markupRows) {
      const result = await client.query<SavedMarkup>(
        `INSERT INTO "EWRInvoiceMarkupRow" ("id", "name", "markup", "reportId")
         VALUES ($1, $2, $3, $4) RETURNING "id", "name", "markup"`,
        [row.id, row.name, row.markup, reportId],
      );
      savedMarkups.push(result.rows[0]);
    }

    await client.query("COMMIT");
    transactionStarted = false;
    const report = savedReport.rows[0];

    return NextResponse.json(
      {
        message: `EWR ${report.ewrNumber} saved successfully.`,
        report: {
          ...report,
          invoices: savedInvoices,
          invoiceMarkups: savedMarkups.map((row) => ({
            id: row.id,
            name: row.name,
            markup: String(row.markup),
          })),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (client && transactionStarted) {
      try { await client.query("ROLLBACK"); } catch (rollbackError) {
        console.error("EWR rollback failed:", rollbackError);
      }
    }
    console.error("SAVE EWR ERROR:", error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return badRequest("An EWR with this number already exists for the selected job.", 409);
    }
    return NextResponse.json({ error: "Unable to save the EWR." }, { status: 500 });
  } finally {
    client?.release();
  }
}
