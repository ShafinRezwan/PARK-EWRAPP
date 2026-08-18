import CreateEWRClient from "@/components/EWR/CreateEWRClient";

import {
  getLabourRates,
  getEquipmentRates,
  getMaterialRates,
} from "@/lib/rates";

import { getWorkReportById } from "@/lib/workReports";
import { getJobs } from "@/lib/jobs";

type Props = {
  searchParams: Promise<{
    id?: string;
    jobId?: string;
    to?: string;
    jobNumber?: string;
    jobName?: string;
    date?: string;
  }>;
};
export default async function Page({ searchParams }: Props) {
  const params = await searchParams;

  const [labourRates, equipmentRates, materialRates, jobs, existingReport] =
    await Promise.all([
      getLabourRates(),
      getEquipmentRates(),
      getMaterialRates(),
      getJobs(),

      params.id ? getWorkReportById(params.id) : Promise.resolve(null),
    ]);

  return (
    <CreateEWRClient
      labourRates={labourRates}
      jobs={jobs}
      equipmentRates={equipmentRates}
      materialRates={materialRates}
      existingReport={existingReport?.formData ?? null}
      reportId={params.id ?? null}
      ewrNumber={existingReport?.ewrNumber ?? null}
      initialParams={
        params.id
          ? null
          : {
              jobId: params.jobId ?? "",
              recipient: params.to ?? "",
              jobNumber: params.jobNumber ?? "",
              jobName: params.jobName ?? "",
              date: params.date ?? "",
            }
      }
    />
  );
}
