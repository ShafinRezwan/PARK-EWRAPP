"use client";

import { useState } from "react";
import styles from "./allJobs.module.css";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import Modal from "@/components/Modal";
import CreateJobModal from "@/components/createJobModal";
import CreateEWRModal from "@/components/CreateEWRModal";
import { Button } from "@base-ui/react";
import WorkReportTable from "@/components/workreports/WorkReportTable";
type WorkReports = {
  divisionCode: string;
  jobType: string;
};

const jobClassifications: WorkReports[] = [
  {
    divisionCode: "01",
    jobType: "Construction",
  },
  {
    divisionCode: "03",
    jobType: "ARC",
  },
  {
    divisionCode: "09",
    jobType: "Trucking",
  },
  {
    divisionCode: "10",
    jobType: "Snow Removal",
  },
  {
    divisionCode: "41",
    jobType: "Underground",
  },
  {
    divisionCode: "42",
    jobType: "Excavation",
  },
  {
    divisionCode: "43",
    jobType: "Landscaping",
  },
  {
    divisionCode: "90",
    jobType: "RCI",
  },
];

export default function Jobs() {
  const [showJobModal, setShowJobModal] = useState(false);
  const [showEWRModal, setShowEWRModal] = useState(false);
  return (
    <main className="flex min-h-screen">
      <Sidebar />

      <section className="flex min-w-0 flex-1 flex-col gap-4 p-7 mx-2">
        <DashboardHeader
          buttonText="Create New Job"
          onButtonClick={() => setShowJobModal(true)}
        />
        <Modal isOpen={showJobModal} onClose={() => setShowJobModal(false)}>
          <CreateJobModal onClose={() => setShowJobModal(false)} />
        </Modal>
        <WorkReportTable></WorkReportTable>

        <Button
          type="button"
          className="fixed -bottom-2 -right-3 flex h-23 w-23 items-center justify-center rounded-full bg-park-green text-4xl opacity-100 text-white shadow-2xl transition-all duration-300 hover:scale-130  hover:bg-park-green-dark active:scale-95 z-50"
          onClick={() => setShowEWRModal(true)}
        >
          +
        </Button>
        <Modal isOpen={showEWRModal} onClose={() => setShowEWRModal(false)}>
          <CreateEWRModal onClose={() => setShowEWRModal(false)} />
        </Modal>
      </section>
    </main>
  );
}
