import CreateEWRClient from "@/components/EWR/CreateEWRClient";

import {
  getLabourRates,
  getEquipmentRates,
  getMaterialRates,
} from "@/lib/rates";

import { getWorkReportById } from "@/lib/workReports";

type Props = {
  searchParams: Promise<{
    id?: string;
    to?: string;
    jobNumber?: string;
    jobName?: string;
    date?: string;
  }>;
};
export default async function Page({ searchParams }: Props) {
  const params = await searchParams;

  const [labourRates, equipmentRates, materialRates, existingReport] =
    await Promise.all([
      getLabourRates(),
      getEquipmentRates(),
      getMaterialRates(),

      params.id ? getWorkReportById(params.id) : Promise.resolve(null),
    ]);

  return (
    <CreateEWRClient
      labourRates={labourRates}
      equipmentRates={equipmentRates}
      materialRates={materialRates}
      existingReport={existingReport}
      reportId={params.id ?? null}
      initialParams={
        params.id
          ? null
          : {
              recipient: params.to ?? "",
              jobNumber: params.jobNumber ?? "",
              jobName: params.jobName ?? "",
              date: params.date ?? "",
            }
      }
    />
  );
}
