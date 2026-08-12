import WorkReportPageClient from "@/components/workreports/WorkReportPageClient";
import { getJobs } from "@/lib/jobs";
import { getWorkReports } from "@/lib/workReports";

export default async function Page() {
  const [jobs, workReports] = await Promise.all([getJobs(), getWorkReports()]);
  return <WorkReportPageClient jobs={jobs} workReports={workReports} />;
}
