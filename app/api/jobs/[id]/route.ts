
import { NextResponse } from "next/server";

import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type JobRow = {
  id: string;
  jobNumber: string;
  jobName: string;
  address: string | null;
  recipient: string | null;
  division: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
};

type PgError = {
  code?: string;
  constraint?: string;
};

// -----------------------------------------
// DELETE JOB
// -----------------------------------------

export async function DELETE(
  request: Request,
  { params }: Props
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  // Temporary role policy; confirm before deployment.
  if (!["ADMIN", "CONTRACTS", "MASTER_USER"].includes(user.role)) {
    return NextResponse.json(
      { error: "Forbidden." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the job to prevent concurrent modifications.
    const jobResult = await client.query<JobRow>(
      `SELECT *
       FROM "Job"
       WHERE "id" = $1
       FOR UPDATE`,
      [id]
    );

    const job = jobResult.rows[0];

    if (!job) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { error: "Job could not be found." },
        { status: 404 }
      );
    }

    // Check for associated work reports.
    const countResult = await client.query<{
      count: string;
    }>(
      `SELECT COUNT(*) AS count
       FROM "ExtraWorkReport"
       WHERE "jobId" = $1`,
      [id]
    );

    const reportCount = Number(
      countResult.rows[0].count
    );

    if (reportCount > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error:
            `Job ${job.jobNumber} cannot be deleted because it has ${reportCount} work report(s).`,
        },
        { status: 409 }
      );
    }

    // Delete the job.
    // PostgreSQL foreign keys protect related records.
    await client.query(
      `DELETE FROM "Job"
       WHERE "id" = $1`,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message:
        `Job ${job.jobNumber} deleted successfully.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    const pgError = error as PgError;

    if (pgError.code === "23503") {
      return NextResponse.json(
        {
          error:
            "This job cannot be deleted because related records still reference it.",
        },
        { status: 409 }
      );
    }

    console.error("DELETE JOB ERROR:", error);

    return NextResponse.json(
      { error: "Unable to delete job." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// -----------------------------------------
// UPDATE JOB
// -----------------------------------------

export async function PUT(
  request: Request,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    // Temporary role policy; confirm before deployment.
    if (!["ADMIN", "CONTRACTS", "MASTER_USER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const jobNumber = String(
      body.jobNumber ?? ""
    ).trim();

    const jobName = String(
      body.jobName ?? ""
    ).trim();

    const address = String(
      body.address ?? ""
    ).trim();

    const recipient = String(
      body.recipient ?? ""
    ).trim();

    const division = String(
      body.division ?? ""
    ).trim();

    const year = Number(body.year);

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (!jobNumber) {
      return NextResponse.json(
        { error: "Job number is required." },
        { status: 400 }
      );
    }

    if (!jobName) {
      return NextResponse.json(
        { error: "Job name is required." },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: "Address is required." },
        { status: 400 }
      );
    }

    if (!division) {
      return NextResponse.json(
        { error: "Division is required." },
        { status: 400 }
      );
    }

    if (
      body.year == null ||
      body.year === "" ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > 9999
    ) {
      return NextResponse.json(
        { error: "A valid year is required." },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Check for existing job
    // -----------------------------------------

    const existingResult = await pool.query(
      `SELECT "id"
       FROM "Job"
       WHERE "id" = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Job could not be found." },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // Prevent duplicate job number/year
    // -----------------------------------------

    const duplicateResult = await pool.query(
      `SELECT "id"
       FROM "Job"
       WHERE "jobNumber" = $1
         AND "year" = $2
         AND "id" <> $3
       LIMIT 1`,
      [jobNumber, year, id]
    );

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            `Job ${jobNumber} already exists for ${year}.`,
        },
        { status: 409 }
      );
    }

    // -----------------------------------------
    // Update job
    // -----------------------------------------

    const result = await pool.query<JobRow>(
      `UPDATE "Job"
       SET
         "jobNumber" = $1,
         "jobName" = $2,
         "address" = $3,
         "recipient" = $4,
         "division" = $5,
         "year" = $6,
         "updatedAt" = NOW()
       WHERE "id" = $7
       RETURNING *`,
      [
        jobNumber,
        jobName,
        address,
        recipient || null,
        division,
        year,
        id,
      ]
    );

    const updatedJob = result.rows[0];

    if (!updatedJob) {
      return NextResponse.json(
        { error: "Job could not be found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message:
        `Job ${updatedJob.jobNumber} updated successfully.`,
      job: updatedJob,
    });
  } catch (error) {
    const pgError = error as PgError;

    if (pgError.code === "23505") {
      return NextResponse.json(
        {
          error:
            "A job with this number already exists for that year.",
        },
        { status: 409 }
      );
    }

    console.error("UPDATE JOB ERROR:", error);

    return NextResponse.json(
      { error: "Unable to update job." },
      { status: 500 }
    );
  }
}
