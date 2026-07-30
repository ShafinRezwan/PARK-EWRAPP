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

        <section className="flex min-h-0 flex-col border-black rounded-md border-[3px] px-4 py-2">
          <div className="flex flex-row items-center justify-between gap-6">
            <h1 className="text-park-green text-3xl mb-4">All Jobs</h1>
          </div>
          <div className="max-h-800 overflow-y-auto pb-10 mx-2 ">
            <div className="space-y-1">
              <div className="grid grid-cols-[180px_1fr] px-6 py-2 text-2xl text-park-gray">
                <span className="underline">Division</span>
              </div>

              {jobClassifications.map((classification) => (
                <Link
                  key={classification.divisionCode}
                  href={`/jobs/division/${classification.divisionCode}`}
                  className="grid grid-cols-[180px_1fr] items-center border-b-2 border-park-gray px-6 py-5 text-2xl hover:bg-gray-100"
                >
                  <span>{classification.divisionCode}</span>
                </Link>
              ))}
            </div>
          </div>
          <Button
            type="button"
            className="fixed -bottom-2 -right-3 flex h-23 w-23 items-center justify-center rounded-full bg-park-green text-4xl opacity-90 text-white shadow-2xl transition-all duration-200 hover:scale-110 hover:opacity-100 hover:bg-park-green-dark active:scale-95 z-50"
            onClick={() => setShowEWRModal(true)}
          >
            +
          </Button>
          <Modal isOpen={showEWRModal} onClose={() => setShowEWRModal(false)}>
            <CreateEWRModal onClose={() => setShowEWRModal(false)} />
          </Modal>
        </section>
      </section>
    </main>
  );
}
