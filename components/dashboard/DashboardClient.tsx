"use client";

import { useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RecentWorkReports from "@/components/dashboard/RecentWorkReports";
import TasksPanel from "@/components/dashboard/TasksPanel";

import Modal from "@/components/Modal";
import CreateJobModal from "@/components/CreateJobModal";
import PageTransition from "@/components/PageTransition";

import type { WorkReports } from "@/types/ewr.types";

type Props = {
  workReports: WorkReports[];
};

export default function DashboardClient({ workReports }: Props) {
  const [showJobModal, setShowJobModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <PageTransition>
      <section className="flex min-w-0 flex-1 flex-col gap-4 p-7 mx-2">
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
        <RecentWorkReports
          workReports={workReports.slice(0, 10)}
          searchQuery={searchQuery}
        />
        <TasksPanel />
      </section>
    </PageTransition>
  );
}
