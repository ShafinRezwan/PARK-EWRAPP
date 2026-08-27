"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";

import type { WorkReports } from "@/types/ewr.types";

type Props = {
  workReports: WorkReports[];
  searchQuery: string;
};

export default function RecentWorkReports({ workReports, searchQuery }: Props) {
  const router = useRouter();

  const parseLocalDate = (value: string) => {
    const dateOnly = value.split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  const search = searchQuery.toLowerCase().trim();

  const filteredReports = workReports.filter((report) => {
    return (
      search === "" ||
      report.jobNumber.toLowerCase().includes(search) ||
      report.jobName.toLowerCase().includes(search) ||
      report.ewrNumber.toLowerCase().includes(search) ||
      report.status.toLowerCase().includes(search) ||
      report.year.toLowerCase().includes(search)
    );
  });

  return (
    <section className="flex min-h-0 flex-col border-black rounded-md border-[3px] px-4 py-2">
      <h1 className="text-park-green text-3xl mb-4">Recent Work Reports</h1>

      <div className="max-h-100 overflow-y-auto pb-10 mx-2">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 text-2xl text-park-gray bg-white ">
            <tr>
              <th className="px-3 py-1 text-center underline">Job #</th>

              <th className="px-3 py-1 text-center underline">Job Name</th>

              <th className="px-3 py-1 text-center underline">EWR #</th>

              <th className="px-3 py-1 text-center underline">Date of Work</th>

              <th className="px-3 py-1 text-center underline">Status</th>
            </tr>
          </thead>

          <tbody className="text-xl text-black">
            {filteredReports.map((report) => (
              <tr
                key={report.id}
                onClick={() => router.push(`/create-ewr?id=${report.id}`)}
                className="cursor-pointer border-b-2 border-park-gray transition hover:bg-gray-100"
              >
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {report.jobNumber}

                    <span className="text-sm italic text-park-green">
                      ({report.year})
                    </span>
                  </div>
                </td>

                <td className="px-3 py-3 text-center">{report.jobName}</td>

                <td className="px-3 py-3 text-center">{report.ewrNumber}</td>

                <td className="px-3 py-3 text-center">
                  {format(parseLocalDate(report.dateOfWork), "MMM dd, yyyy")}
                </td>

                <td className="px-3 py-3 text-center">{report.status}</td>
              </tr>
            ))}

            {filteredReports.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-park-gray"
                >
                  {searchQuery.trim()
                    ? `No work reports found for "${searchQuery}".`
                    : "No work reports found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/*
<section className="flex min-h-0 flex-col border-black rounded-md border-[3px] px-4 py-2">
  <h1 className="text-park-green text-3xl mb-4">Recent Work Reports</h1>

  <div className="max-h-400 overflow-y-auto pb-10 mx-2">
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
      <tbody className="text-xl text-black">
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
</section>;
*/
