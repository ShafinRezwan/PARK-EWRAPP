import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(request:Request){

    try {
        
        const body = await request.json();

        const {
            jobNumber,
            jobName,
            division,
            year,
            recipient,
        } = body;

         if (!jobNumber || !jobName || !division || !year) {
      return NextResponse.json(
        {
          error: "Job number, job name, division, and year are required.",
        },
        {
          status: 400,
        },
      );
    }

    const existingJob = await prisma.job.findUnique({
        where: {
            jobNumber,
        },
    });

     if (existingJob) {
      return NextResponse.json(
        {
          error: `Job ${jobNumber} already exists.`,
        },
        {
          status: 409,
        },
      );
    }

    const job = await prisma.job.create({
      data: {
        jobNumber: String(jobNumber).trim(),
        jobName: String(jobName).trim(),
        division: String(division).trim(),
        recipient: recipient? String(recipient).trim(): null,
        year: Number(year),
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
    console.error("Create Job Error:", error);

    return NextResponse.json(
      {
        error: "Unable to create job.",
      },
      {
        status: 500,
      },
    );
    
    
    }
    
    
    
}