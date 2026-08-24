import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: Request,
  { params }: Props,
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: {
        id,
      },

      include: {
        _count: {
          select: {
            extraWorkReports: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "Job could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (job._count.extraWorkReports > 0) {
      return NextResponse.json(
        {
          error:
            `Job ${job.jobNumber} cannot be deleted because it has ${job._count.extraWorkReports} work report(s).`,
        },
        {
          status: 409,
        },
      );
    }

    await prisma.job.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message:
        `Job ${job.jobNumber} deleted successfully.`,
    });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete job.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: Props,
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      jobNumber,
      jobName,
      address,
      recipient,
      division,
      year,
    } = body;

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (!jobNumber?.trim()) {
      return NextResponse.json(
        {
          error: "Job number is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!jobName?.trim()) {
      return NextResponse.json(
        {
          error: "Job name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!address?.trim()) {
      return NextResponse.json(
        {
          error: "Address is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!division) {
      return NextResponse.json(
        {
          error: "Division is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!year) {
      return NextResponse.json(
        {
          error: "Year is required.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------
    // Make sure job exists
    // -----------------------------------------

    const existingJob =
      await prisma.job.findUnique({
        where: {
          id,
        },
      });

    if (!existingJob) {
      return NextResponse.json(
        {
          error: "Job could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------------------
    // Prevent duplicate Job # + Year
    // -----------------------------------------

    const duplicateJob =
      await prisma.job.findFirst({
        where: {
          jobNumber: jobNumber.trim(),
          year: Number(year),

          id: {
            not: id,
          },
        },
      });

    if (duplicateJob) {
      return NextResponse.json(
        {
          error: `Job ${jobNumber} already exists for ${year}.`,
        },
        {
          status: 409,
        },
      );
    }

    // -----------------------------------------
    // Update job
    // -----------------------------------------

    const updatedJob =
      await prisma.job.update({
        where: {
          id,
        },

        data: {
          jobNumber: jobNumber.trim(),
          jobName: jobName.trim(),
          address: address.trim(),

          recipient:
            recipient?.trim() || null,

          division,
          year: Number(year),
        },
      });

    // -----------------------------------------
    // Success
    // -----------------------------------------

    return NextResponse.json({
      message:
        `Job ${updatedJob.jobNumber} updated successfully.`,

      job: updatedJob,
    });
  } catch (error) {
    console.error(
      "UPDATE JOB ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update job.",
      },
      {
        status: 500,
      },
    );
  }
}