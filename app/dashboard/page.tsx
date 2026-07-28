"use client";
import { useState } from "react";
import Sidebar from "../../components/sidebar";
import styles from "./dashboard.module.css";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import RecentWorkReports from "@/components/dashboard/RecentWorkReports";
import TasksPanel from "@/components/dashboard/TasksPanel";
import Modal from "@/components/Modal";
import CreateJobModal from "@/components/CreateJobModal";
export default function Dashboard() {
  const [showJobModal, setShowJobModal] = useState(false);

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
        <RecentWorkReports />
        <TasksPanel />
      </section>
    </main>
  );
}
