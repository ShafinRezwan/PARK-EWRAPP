import RateTable from "@/components/rateguide/RateTable";
import Sidebar from "@/components/sidebar";
import {
  getLabourRates,
  getEquipmentRates,
  getMaterialRates,
} from "@/lib/rates";

import React from "react";

export default async function page() {
  const labourRates = await getLabourRates();
  const equipmentRates = await getEquipmentRates();
  const materialRates = await getMaterialRates();

  return (
    <main className="flex h-screen overflow-hidden">
      <section className="flex min-h-0 flex-1 flex-col gap-4 p-7 mx-2 ">
        <RateTable
          labourRates={labourRates}
          equipmentRates={equipmentRates}
          materialRates={materialRates}
        />
      </section>
    </main>
  );
}
