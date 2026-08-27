import DashboardClient from "@/components/dashboard/DashboardClient";
import { getWorkReports } from "@/lib/workReports";

export default async function Dashboard() {
  const workReports = await getWorkReports();

  return <DashboardClient workReports={workReports} />;
}
