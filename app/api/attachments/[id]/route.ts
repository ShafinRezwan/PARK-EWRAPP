
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getUploadRoot } from "@/lib/fileStorage";

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type AttachmentRow = {
  id: string;
  reportId: string;
  invoiceId: string | null;
  fileName: string;
  fileType: string;
  pathname: string;
};

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function GET(
  request: Request,
  { params }: Props
) {
  try {
    // 1. Verify authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    // 2. Retrieve attachment metadata
    const { id } = await params;

    const result = await pool.query<AttachmentRow>(
      `SELECT
         "id",
         "reportId",
         "invoiceId",
         "fileName",
         "fileType",
         "pathname"
       FROM "Attachment"
       WHERE "id" = $1
       LIMIT 1`,
      [id]
    );

    const attachment = result.rows[0];

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found." },
        { status: 404 }
      );
    }

    // 3. Enforce report access permissions
    // TODO: Replace this with the same report-level
    // authorization policy used by your EWR API.
    //
    // Authentication alone is not sufficient if
    // users have restricted access to reports.

    // 4. Resolve the file inside private storage
    const root = getUploadRoot();

    const relativePath = attachment.pathname;

    if (
      !relativePath ||
      path.isAbsolute(relativePath) ||
      relativePath.includes("\\") ||
      relativePath.split("/").some(
        (segment) =>
          segment === ".." ||
          segment === "." ||
          segment === ""
      )
    ) {
      return NextResponse.json(
        { error: "Invalid attachment path." },
        { status: 500 }
      );
    }

    const absolutePath = path.resolve(
      root,
      ...relativePath.split("/")
    );

    const relativeToRoot = path.relative(
      root,
      absolutePath
    );

    if (
      relativeToRoot === ".." ||
      relativeToRoot.startsWith(".." + path.sep) ||
      path.isAbsolute(relativeToRoot)
    ) {
      return NextResponse.json(
        { error: "Invalid attachment path." },
        { status: 500 }
      );
    }

    // 5. Check whether the file exists
    let fileInfo;

    try {
      fileInfo = await stat(absolutePath);

      if (!fileInfo.isFile()) {
        throw new Error("Not a regular file");
      }
    } catch (error) {
      if (
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return NextResponse.json(
          { error: "Attachment file not found." },
          { status: 404 }
        );
      }

      throw error;
    }

    // 6. Stream the file to the browser
    const nodeStream = createReadStream(absolutePath);

    const webStream = Readable.toWeb(
      nodeStream
    ) as ReadableStream<Uint8Array>;

    const safeName = attachment.fileName
      .replace(/[\r\n"\\]/g, "_")
      .replace(/[^\x20-\x7E]/g, "_");

    const contentType = allowedTypes.has(
      attachment.fileType
    )
      ? attachment.fileType
      : "application/octet-stream";

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition":
          `inline; filename="${safeName}"`,
        "Content-Length": String(fileInfo.size),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("LOAD ATTACHMENT ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load attachment." },
      { status: 500 }
    );
  }
}
