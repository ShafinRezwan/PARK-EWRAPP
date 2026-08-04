import RateTable from "@/components/rateguide/RateTable";
import Sidebar from "@/components/sidebar";
import React from "react";

export default function page() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <section className="flex min-w-0 flex-1 flex-col  p-7 mx-2">
        <RateTable />
      </section>
    </main>
  );
}
