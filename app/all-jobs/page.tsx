import React from "react";
import styles from "./allJobs.module.css";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/sidebar";

export default function page() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />

      <section className="flex min-w-0 flex-1 flex-col gap-4 p-7 mx-2">
        <DashboardHeader />
      </section>
    </main>
  );
}
