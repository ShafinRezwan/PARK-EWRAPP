import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      jobNumber,
      jobName,
      address,
      division,
      year,
      recipient,
    } = body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!jobNumber || !jobName || !division || !year) {
      return NextResponse.json(
        {
          error:
            "Job number, job name, division, and year are required.",
        },
        {
          status: 400,
        },
      );
    }

    const parsedYear = Number(year);

    if (!Number.isInteger(parsedYear)) {
      return NextResponse.json(
        {
          error: "A valid year is required.",
        },
        {
          status: 400,
        },
      );
    }

    const cleanJobNumber = String(jobNumber).trim();

    // -----------------------------
    // Check duplicate job/year
    // -----------------------------

    const existingJob = await prisma.job.findUnique({
      where: {
        jobNumber_year: {
          jobNumber: cleanJobNumber,
          year: parsedYear,
        },
      },
    });

    if (existingJob) {
      return NextResponse.json(
        {
          error: `Job ${cleanJobNumber} already exists for ${parsedYear}.`,
        },
        {
          status: 409,
        },
      );
    }

    // -----------------------------
    // Create job
    // -----------------------------

    const job = await prisma.job.create({
      data: {
        jobNumber: cleanJobNumber,
        jobName: String(jobName).trim(),
        address: address.trim(),
        division: String(division).trim(),
        year: parsedYear,

        recipient:
          recipient && String(recipient).trim() !== ""
            ? String(recipient).trim()
            : null,
      },
    });

    return NextResponse.json(
      {
        message: "Job created successfully.",
        job,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("CREATE JOB ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create job.",
      },
      {
        status: 500,
      },
    );
  }
}