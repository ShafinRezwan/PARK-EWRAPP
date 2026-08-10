import CreateEWRClient from "@/components/EWR/CreateEWRClient";
import {
  getLabourRates,
  getEquipmentRates,
  getMaterialRates,
} from "@/lib/rates";

export default async function Page() {
  const labourRates = await getLabourRates();
  const equipmentRates = await getEquipmentRates();
  const materialRates = await getMaterialRates();

  return (
    <CreateEWRClient
      labourRates={labourRates}
      equipmentRates={equipmentRates}
      materialRates={materialRates}
    />
  );
}
