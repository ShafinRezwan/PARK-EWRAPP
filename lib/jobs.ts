import { prisma } from "./prisma";


export type Job = {
  id: string;
  jobNumber: string;
  jobName: string;
  division: string;
  year: number;
  recipient: string | null;
};


export async function getJobs(){

    const jobs = await prisma.job.findMany({
    orderBy: {
      jobNumber: "asc",
    },
  });
   
    return jobs.map((job) => ({
    id: job.id,
    jobNumber: job.jobNumber,
    jobName: job.jobName,
    division: job.division,
    year: job.year,
    recipient: job.recipient,

  }));
}
