
import { NextResponse } from "next/server";

import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

type ExistingReportRow = {
  id: string;
};

export async function POST(request: Request) {
  try {
    // Verify the user is logged in
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const jobId = String(body.jobId ?? "").trim();
    const ewrNumber = String(body.ewrNumber ?? "").trim();

    const reportId = body.reportId
      ? String(body.reportId).trim()
      : null;

    // Preserve existing behavior
    if (!jobId || !ewrNumber) {
      return NextResponse.json({
        exists: false,
      });
    }

    // Check whether another EWR has this number
    // for the same job.
    const result = await pool.query<ExistingReportRow>(
      `SELECT "id"
       FROM "ExtraWorkReport"
       WHERE "jobId" = $1
         AND "ewrNumber" = $2
         AND ($3::text IS NULL OR "id" <> $3::text)
       LIMIT 1`,
      [jobId, ewrNumber, reportId]
    );

    return NextResponse.json({
      exists: result.rows.length > 0,
    });
  } catch (error) {
    console.error("CHECK EWR NUMBER ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to check EWR number.",
      },
      {
        status: 500,
      }
    );
  }
}
