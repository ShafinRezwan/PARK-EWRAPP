import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const jobNumber = String(body.jobNumber ?? "").trim();
    const ewrNumber = String(body.ewrNumber ?? "").trim();
    const reportId = body.reportId
      ? String(body.reportId)
      : null;

    if (!jobNumber || !ewrNumber) {
      return NextResponse.json({
        exists: false,
      });
    }

    const job = await prisma.job.findUnique({
      where: {
        jobNumber,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "Job not found.",
        },
        {
          status: 404,
        },
      );
    }

    const existingReport =
      await prisma.extraWorkReport.findFirst({
        where: {
          jobId: job.id,
          ewrNumber,

          // Important when editing an existing EWR:
          // don't treat the current report as a duplicate.
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