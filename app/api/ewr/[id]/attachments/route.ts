// app/api/ewr/[id]/attachments/route.ts

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Props,
) {
  try {
    const { id: reportId } = await params;

    const formData = await request.formData();

    const uploadedFile = formData.get("file");

    const invoiceId = String(
      formData.get("invoiceId") ?? "",
    ).trim();

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        {
          error: "No attachment was uploaded.",
        },
        {
          status: 400,
        },
      );
    }

    if (!invoiceId) {
      return NextResponse.json(
        {
          error: "Invoice ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      return NextResponse.json(
        {
          error:
            "Only PDF, JPG, PNG, and WEBP attachments are supported.",
        },
        {
          status: 400,
        },
      );
    }

    const report =
      await prisma.extraWorkReport.findUnique({
        where: {
          id: reportId,
        },

        select: {
          id: true,
          ewrNumber: true,
        },
      });

    if (!report) {
      return NextResponse.json(
        {
          error: "EWR could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const invoice =
      await prisma.eWRInvoiceRow.findFirst({
        where: {
          id: invoiceId,
          reportId,
        },
      });

    if (!invoice) {
      return NextResponse.json(
        {
          error:
            "Invoice could not be found for this EWR.",
        },
        {
          status: 404,
        },
      );
    }

    const safeFileName =
      uploadedFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_",
      );

    const pathname =
      `ewr/${reportId}/invoices/${invoiceId}/${crypto.randomUUID()}-${safeFileName}`;

    const token =
      process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN is not configured.",
      );
    }

    const blob = await put(
      pathname,
      uploadedFile,
      {
        access: "private",
        addRandomSuffix: false,
        token,
      },
    );

    const attachment =
      await prisma.attachment.create({
        data: {
          reportId,
          invoiceId,

          fileName: uploadedFile.name,
          fileType: uploadedFile.type,

          fileUrl: blob.url,
          pathname: blob.pathname,
        },
      });

    return NextResponse.json(
      {
        message:
          "Invoice attachment uploaded successfully.",

        attachment: {
          id: attachment.id,
          fileName: attachment.fileName,
          fileType: attachment.fileType,
          fileUrl: attachment.fileUrl,
          pathname: attachment.pathname,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "UPLOAD EWR ATTACHMENT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload attachment.",
      },
      {
        status: 500,
      },
    );
  }
}