import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const jobId = String(body.jobId ?? "").trim();
    const ewrNumber = String(body.ewrNumber ?? "").trim();

    const reportId = body.reportId
      ? String(body.reportId)
      : null;

    if (!jobId || !ewrNumber) {
      return NextResponse.json({
        exists: false,
      });
    }

    const existingReport =
      await prisma.extraWorkReport.findFirst({
        where: {
          jobId,
          ewrNumber,

          // When editing an existing EWR,
          // don't count itself as a duplicate.
          ...(reportId
            ? {
                NOT: {
                  id: reportId,
                },
              }
            : {}),
        },
      });

    return NextResponse.json({
      exists: !!existingReport,
    });
  } catch (error) {
    console.error("CHECK EWR NUMBER ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to check EWR number.",
      },
      {
        status: 500,
      },
    );
  }
}