import React from "react";

type WorkReports = {
  jobNumber: string;
  jobName: string;
  ewrNumber: string;
  dateOfWork: string;
  status: "Sent" | "Pending";
};

//Will replace to be dynamic later
const reports: WorkReports[] = [
  {
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Sent",
  },
  {
    jobNumber: "25-042",
    jobName: "Orchards 44",
    ewrNumber: "9841",
    dateOfWork: "05/12/2026",
    status: "Pending",
  },
  {
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Sent",
  },
  {
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Pending",
  },
  {
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Pending",
  },
  {
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Sent",
  },
  {
    jobNumber: "25-042",
    jobName: "Orchards 44",
    ewrNumber: "9841",
    dateOfWork: "05/12/2026",
    status: "Pending",
  },
];

export default function RecentWorkReports() {
  return (
    <section className="flex min-h-0 flex-col border-black rounded-md border-[3px] px-4 py-2">
      <h1 className="text-park-green text-3xl mb-4">Recent Work Reports</h1>

      <div className="max-h-[400px] overflow-y-auto pb-10 mx-2">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 text-2xl text-park-gray bg-white ">
            <tr>
              <th className="px-3 py-1 text-center underline ">Job #</th>
              <th className="px-3 py-1 text-center underline">Job Name</th>
              <th className="px-3 py-1 text-center underline ">EWR #</th>
              <th className="px-3 py-1 text-center underline">Date of Work</th>
              <th className="px-3 py-1 text-center underline">Sent</th>
            </tr>
          </thead>
          <tbody className="text-xl text-black mx-300">
            {reports.map((report, index) => (
              <tr
                key={`${report.ewrNumber}-${index}`}
                className="border-b-2 border-park-gray"
              >
                <td className="px-3 py-3 text-center">{report.jobNumber}</td>

                <td className="px-3 py-3 text-center">{report.jobName}</td>

                <td className="px-3 py-3 text-center">{report.ewrNumber}</td>

                <td className="px-3 py-3 text-center">{report.dateOfWork}</td>
                <td className="px-3 py-3 text-center">{report.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
