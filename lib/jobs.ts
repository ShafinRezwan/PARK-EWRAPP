
import "server-only";

import { pool } from "./db";

export type Job = {
  id: string;
  address: string | null;
  jobNumber: string;
  jobName: string;
  division: string;
  year: number;
  recipient: string | null;
};

export async function getJobs(): Promise<Job[]> {
  const result = await pool.query<Job>(
    `SELECT
       "id",
       "jobNumber",
       "jobName",
       "address",
       "division",
       "year",
       "recipient"
     FROM "Job"
     ORDER BY "jobNumber" ASC`
  );

  return result.rows;
}
