"use client";
import { useState } from "react";
import { divisions } from "@/types/ewr.types";
import { Job } from "@/lib/jobs";
import { useRouter } from "next/navigation";
import { WorkReports } from "@/lib/workReports";
import { format } from "date-fns";

import EditJobModal from "@/components/EditJobModal";
import Modal from "../Modal";

type Props = {
  jobs: Job[];
  workReports: WorkReports[];
  searchQuery: string;
};

export default function WorkReportTable({
  jobs,
  workReports,
  searchQuery,
}: Props) {
  const [tableView, setTableView] = useState<"reports" | "jobs">("reports");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectYear, setSelectYear] = useState("All");
  const router = useRouter();

  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const filteredReports = workReports.filter((report) => {
    const matchesDivision =
      selectedDivision === "All" || report.divisionCode === selectedDivision;

    const matchesYear = selectYear === "All" || report.year === selectYear;

    const search = (searchQuery ?? "").toLowerCase().trim();

    const matchesSearch =
      search === "" ||
      (report.jobNumber ?? "").toLowerCase().includes(search) ||
      (report.jobName ?? "").toLowerCase().includes(search) ||
      (report.ewrNumber ?? "").toLowerCase().includes(search) ||
      (report.status ?? "").toLowerCase().includes(search);

    return matchesDivision && matchesYear && matchesSearch;
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesDivision =
      selectedDivision === "All" || job.division === selectedDivision;

    const matchesYear = selectYear === "All" || String(job.year) === selectYear;

    const search = (searchQuery ?? "").toLowerCase().trim();

    const matchesSearch =
      search === "" ||
      (job.jobNumber ?? "").toLowerCase().includes(search) ||
      (job.jobName ?? "").toLowerCase().includes(search) ||
      (job.division ?? "").toLowerCase().includes(search) ||
      String(job.year ?? "").includes(search);

    return matchesDivision && matchesYear && matchesSearch;
  });

  const parseLocalDate = (value: string) => {
    const dateOnly = value.split("T")[0];

    const [year, month, day] = dateOnly.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  const currentYear = new Date().getFullYear();

  const years = [
    "All",
    ...Array.from({ length: currentYear - 2019 }, (_, i) =>
      String(currentYear - i),
    ),
  ];

  return (
    <section className="flex h-full flex-col border-black rounded-md border-[3px] px-4 py-2">
      <div className="flex justify-between">
        <h1 className="text-park-green text-3xl mb-4">
          {tableView === "reports" ? "All  Work Reports" : "All Jobs"}
        </h1>
        <div className="flex gap-2">
          <div className="flex gap-3 text-lg text-park-gray">
            <div className="relative group">
              <button
                type="button"
                onClick={() =>
                  setTableView((current) =>
                    current === "reports" ? "jobs" : "reports",
                  )
                }
                className="cursor-pointer underline transition-all duration-200 ease-in-out hover:text-park-green"
              >
                {tableView === "reports" ? "Work Reports" : "Jobs"}
              </button>
            </div>

            <div className="relative group">
              <button
                type="button"
                className="cursor-pointer underline transition-all duration-200 ease-in-out hover:text-park-green"
              >
                {selectedDivision === "All"
                  ? "Division"
                  : `Division - ${selectedDivision}`}
              </button>

              <div className=" pointer-events-none  cursor-pointer absolute right-0 z-50  max-h-0 -translate-y-2 overflow-hidden rounded-md border-2 border-black bg-white py-0 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:max-h-125 group-hover:translate-y-0  group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setSelectedDivision("All")}
                  className={`block w-full cursor-pointer px-5 py-2 text-left ${
                    selectedDivision === "All"
                      ? "bg-park-green text-white"
                      : "hover:bg-gray-100 hover:text-park-green"
                  }`}
                >
                  All
                </button>
                {divisions.map((division) => (
                  <button
                    key={division.code}
                    type="button"
                    onClick={() => setSelectedDivision(division.code)}
                    className={` cursor-pointer block w-full px-5 py-2 text-left ${
                      selectedDivision === division.code
                        ? "bg-park-green text-white"
                        : "hover:bg-gray-100 hover:text-park-green"
                    }`}
                  >
                    {division.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button
                type="button"
                className="underline cursor-pointer transition-all ease-in-out hover:text-park-green duration-200"
              >
                {selectYear === "All" ? "Year" : selectYear}
              </button>

              <div className=" pointer-events-none  absolute -right-8 z-50  max-h-0 -translate-y-2 overflow-hidden rounded-md border-2 border-black bg-white py-0 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:max-h-125 group-hover:translate-y-0  group-hover:opacity-100 ">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectYear(String(year))}
                    className={`block cursor-pointer w-full px-5 py-2 text-center ${
                      selectYear === year
                        ? "bg-park-green text-white"
                        : "hover:bg-gray-100 hover:text-park-green"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-h-400 overflow-y-auto pb-10 mx-2">
        {tableView === "reports" ? (
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 text-2xl text-park-gray bg-white ">
              <tr>
                <th className="px-3 py-1 text-center underline ">Job #</th>
                <th className="px-3 py-1 text-center underline">Job Name</th>
                <th className="px-3 py-1 text-center underline ">EWR #</th>
                <th className="px-3 py-1 text-center underline">
                  Date of Work
                </th>
                <th className="px-3 py-1 text-center underline">Sent</th>
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
                      {report.jobNumber}{" "}
                      <span className="text-sm text-park-green italic ">
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
            </tbody>
          </table>
        ) : (
          <>
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-white text-2xl text-park-gray">
                <tr>
                  <th className="px-3 py-1 text-center underline">Job #</th>

                  <th className="px-3 py-1 text-center underline">Job Name</th>

                  <th className="px-3 py-1 text-center underline">Division</th>

                  <th className="px-3 py-1 text-center underline">Year</th>
                </tr>
              </thead>

              <tbody className="text-xl text-black">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="cursor-pointer border-b-2 border-park-gray transition hover:bg-gray-100"
                    onClick={() => setEditingJob(job)}
                  >
                    <td className="px-3 py-3 text-center">{job.jobNumber}</td>

                    <td className="px-3 py-3 text-center">{job.jobName}</td>

                    <td className="px-3 py-3 text-center">{job.division}</td>

                    <td className="px-3 py-3 text-center">{job.year}</td>

                    <td className="px-3 py-3"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      <Modal isOpen={editingJob !== null} onClose={() => setEditingJob(null)}>
        {editingJob && (
          <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} />
        )}
      </Modal>
    </section>
  );
}
