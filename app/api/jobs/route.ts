
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

type JobRow = {
  id: string;
  jobNumber: string;
  jobName: string;
  address: string | null;
  division: string;
  year: number;
  recipient: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // Authentication
    // -----------------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // Read request body
    // -----------------------------------------

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

    const division = String(
      body.division ?? ""
    ).trim();

    const recipient = String(
      body.recipient ?? ""
    ).trim();

    const parsedYear = Number(body.year);

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (
      !jobNumber ||
      !jobName ||
      !division ||
      body.year == null ||
      body.year === ""
    ) {
      return NextResponse.json(
        {
          error:
            "Job number, job name, division, and year are required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 1900 ||
      parsedYear > 9999
    ) {
      return NextResponse.json(
        {
          error: "A valid year is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Check duplicate job/year
    // -----------------------------------------

    const existingJob = await pool.query(
      `SELECT "id"
       FROM "Job"
       WHERE "jobNumber" = $1
         AND "year" = $2
       LIMIT 1`,
      [jobNumber, parsedYear]
    );

    if (existingJob.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            `Job ${jobNumber} already exists for ${parsedYear}.`,
        },
        { status: 409 }
      );
    }

    // -----------------------------------------
    // Create job
    // -----------------------------------------

    const result = await pool.query<JobRow>(
      `INSERT INTO "Job" (
         "id",
         "jobNumber",
         "jobName",
         "address",
         "division",
         "year",
         "recipient",
         "createdAt",
         "updatedAt"
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         NOW(), NOW()
       )
       RETURNING *`,
      [
        randomUUID(),
        jobNumber,
        jobName,
        address || null,
        division,
        parsedYear,
        recipient || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Job created successfully.",
        job: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    // PostgreSQL unique constraint violation
    const pgError = error as {
      code?: string;
      constraint?: string;
    };

    if (
      pgError.code === "23505" &&
      pgError.constraint === "Job_jobNumber_year_key"
    ) {
      return NextResponse.json(
        {
          error:
            "A job with this number already exists for that year.",
        },
        { status: 409 }
      );
    }

    console.error("CREATE JOB ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to create job.",
      },
      { status: 500 }
    );
  }
}
