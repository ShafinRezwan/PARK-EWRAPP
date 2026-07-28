import Sidebar from "../../components/sidebar";
import styles from "./dashboard.module.css";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import RecentWorkReports from "@/components/dashboard/RecentWorkReports";
import TasksPanel from "@/components/dashboard/TasksPanel";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />

      <section className="flex min-w-0 flex-1 flex-col gap-4 p-7 mx-2">
        <DashboardHeader />
        <RecentWorkReports />
        <TasksPanel />
      </section>
    </main>
  );
}
