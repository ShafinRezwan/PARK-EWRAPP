import RateTable from "@/components/rateguide/RateTable";
import Sidebar from "@/components/sidebar";
import { getLabourRates } from "@/lib/rates";

import React from "react";

export default async function page() {
  const databaseRates = await getLabourRates();
  const labourRates = databaseRates.map((rate) => ({
    id: rate.id,
    employeeNumber: rate.employeeNumber,
    baseWorkClass: rate.baseWorkClass,
    baseClassName: rate.baseClassName,
    rate: Number(rate.rate),
    saturdayRate: Number(rate.saturdayRate),
    sundayRate: Number(rate.sundayRate),
  }));

  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar />
      <section className="flex min-h-0 flex-1 flex-col gap-4 p-7 mx-2 ">
        <RateTable labourRates={labourRates} />
      </section>
    </main>
  );
}
