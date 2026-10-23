// app/api/ewr/[id]/attachments/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  MAX_ATTACHMENT_SIZE,
  getExtension,
  saveAttachment,
  deleteStoredFile,
} from "@/lib/fileStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function matchesSignature(bytes: Uint8Array, type: string): boolean {
  if (type === "application/pdf") {
    return bytes.length >= 5 && String.fromCharCode(...bytes.subarray(0, 5)) === "%PDF-";
  }
  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    return bytes.length >= 8 && signature.every((value, index) => bytes[index] === value);
  }
  if (type === "image/webp") {
    return bytes.length >= 12 &&
      String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";
  }
  return false;
}

export async function POST(request: Request, { params }: Props) {
  let savedAbsolutePath: string | null = null;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    // TODO: Apply your organization's attachment-upload role/ownership policy here.
    const { id: reportId } = await params;
    const formData = await request.formData();
    const uploadedFile = formData.get("file");
    const invoiceId = String(formData.get("invoiceId") ?? "").trim();

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "No attachment was uploaded." }, { status: 400 });
    }
    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required." }, { status: 400 });
    }
    const extension = getExtension(uploadedFile.type);
    if (!extension) {
      return NextResponse.json({ error: "Only PDF, JPG, PNG, and WEBP attachments are supported." }, { status: 400 });
    }
    if (uploadedFile.size === 0 || uploadedFile.size > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json({ error: "Attachment must be between 1 byte and 20 MB." }, { status: 413 });
    }
    const header = new Uint8Array(await uploadedFile.slice(0, 16).arrayBuffer());
    if (!matchesSignature(header, uploadedFile.type)) {
      return NextResponse.json({ error: "Attachment content does not match its file type." }, { status: 400 });
    }

    const validInvoice = await pool.query(
      `SELECT 1 FROM "EWRInvoiceRow" i
       INNER JOIN "ExtraWorkReport" r ON r."id" = i."reportId"
       WHERE i."id" = $1 AND i."reportId" = $2 LIMIT 1`,
      [invoiceId, reportId],
    );
    if (!validInvoice.rowCount) {
      return NextResponse.json({ error: "Invoice could not be found for this EWR." }, { status: 404 });
    }

    const saved = await saveAttachment(uploadedFile, reportId, invoiceId, extension);
    savedAbsolutePath = saved.absolutePath;
    const attachmentId = randomUUID();
    const fileUrl = `/api/attachments/${attachmentId}`;

    const result = await pool.query<{
      id: string;
      fileName: string;
      fileType: string;
      fileUrl: string;
      pathname: string;
    }>(
      `INSERT INTO "Attachment"
       ("id", "reportId", "invoiceId", "fileName", "fileType", "fileUrl", "pathname", "uploadedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING "id", "fileName", "fileType", "fileUrl", "pathname"`,
      [attachmentId, reportId, invoiceId, uploadedFile.name, uploadedFile.type, fileUrl, saved.pathname],
    );
    savedAbsolutePath = null;

    return NextResponse.json(
      { message: "Invoice attachment uploaded successfully.", attachment: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    if (savedAbsolutePath) {
      try {
        await deleteStoredFile(savedAbsolutePath);
      } catch (cleanupError) {
        console.error("Unable to clean up failed attachment upload:", cleanupError);
      }
    }
    console.error("UPLOAD EWR ATTACHMENT ERROR:", error);
    return NextResponse.json({ error: "Unable to upload attachment." }, { status: 500 });
  }
}
