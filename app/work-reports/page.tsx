import WorkReportPageClient from "@/components/workreports/WorkReportPageClient";
import { getJobs } from "@/lib/jobs";

export default async function Page() {
  const jobs = await getJobs();

  return <WorkReportPageClient jobs={jobs} />;
}
