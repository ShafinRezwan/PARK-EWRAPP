// app/api/attachments/[id]/route.ts

import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Props,
) {
  try {
    const { id } = await params;

    // -----------------------------------------
    // Find attachment metadata
    // -----------------------------------------

    const attachment =
      await prisma.attachment.findUnique({
        where: {
          id,
        },
      });

    if (!attachment) {
      return NextResponse.json(
        {
          error: "Attachment not found.",
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------------------
    // Blob credentials
    // -----------------------------------------

    const token =
      process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN is not configured.",
      );
    }

    // -----------------------------------------
    // Fetch private Blob
    // -----------------------------------------

    const blob = await get(
      attachment.pathname,
      {
        access: "private",
        token,
      },
    );

    if (!blob) {
      return NextResponse.json(
        {
          error:
            "Attachment file could not be found in Blob storage.",
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------------------
    // Stream file to browser
    // -----------------------------------------

    return new Response(blob.stream, {
      status: 200,

      headers: {
        "Content-Type":
          attachment.fileType ||
          "application/octet-stream",

        "Content-Disposition":
          `inline; filename="${attachment.fileName}"`,

        "Cache-Control":
          "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "LOAD ATTACHMENT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load attachment.",
      },
      {
        status: 500,
      },
    );
  }
}