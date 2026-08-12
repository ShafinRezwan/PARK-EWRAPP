"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/sidebar";
import Modal from "@/components/Modal";
import CreateJobModal from "@/components/createJobModal";
import CreateEWRModal from "@/components/CreateEWRModal";
import { Button } from "@base-ui/react";
import WorkReportTable from "@/components/workreports/WorkReportTable";
import { Job } from "@/lib/jobs";
import { WorkReports } from "@/lib/workReports";

type Props = {
  jobs: Job[];
  workReports: WorkReports[];
};

export default function WorkReportPageClient({ jobs, workReports }: Props) {
  const [showJobModal, setShowJobModal] = useState(false);
  const [showEWRModal, setShowEWRModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <main className="flex min-h-screen">
      <section className="mx-2 flex min-w-0 flex-1 flex-col gap-4 p-7">
        <DashboardHeader
          buttonText="Create New Job"
          onButtonClick={() => setShowJobModal(true)}
          searchPlaceholder="Search jobs and work reports"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Modal isOpen={showJobModal} onClose={() => setShowJobModal(false)}>
          <CreateJobModal onClose={() => setShowJobModal(false)} />
        </Modal>

        <WorkReportTable
          jobs={jobs}
          workReports={workReports}
          searchQuery={searchQuery}
        />

        <Button
          type="button"
          className="fixed -bottom-2 -right-3 z-50 flex h-23 w-23 items-center justify-center rounded-full bg-park-green text-4xl text-white shadow-2xl transition-all duration-300 hover:scale-130 hover:bg-park-green-dark active:scale-95"
          onClick={() => setShowEWRModal(true)}
        >
          +
        </Button>

        <Modal isOpen={showEWRModal} onClose={() => setShowEWRModal(false)}>
          <CreateEWRModal jobs={jobs} onClose={() => setShowEWRModal(false)} />
        </Modal>
      </section>
    </main>
  );
}
