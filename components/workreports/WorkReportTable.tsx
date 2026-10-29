"use client";

import { useRef, useState } from "react";

import { divisions } from "@/types/ewr.types";

import { Job } from "@/lib/jobs";

import { useRouter } from "next/navigation";

import type { WorkReports } from "@/types/ewr.types";

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

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [isDeletingReport, setIsDeletingReport] = useState(false);

  const [deleteReportError, setDeleteReportError] = useState("");

  const [pressingReportId, setPressingReportId] = useState<string | null>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const longPressTriggered = useRef(false);

  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [actionReport, setActionReport] = useState<WorkReports | null>(null);

  const [selectedStatus, setSelectedStatus] = useState("");

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [statusError, setStatusError] = useState("");

  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, string>
  >({});

  async function handleUpdateStatus() {
    if (!actionReport) return;

    setIsUpdatingStatus(true);

    setStatusError("");

    try {
      const response = await fetch(
        `/api/ewr/${actionReport.id}/status`,

        {
          method: "PATCH",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ status: selectedStatus }),
        },
      );

      const result = await response.json();

      if (!response.ok)
        throw new Error(result.error ?? "Unable to update status.");

      setStatusOverrides((current) => ({
        ...current,

        [actionReport.id]: result.status,
      }));

      setActionReport(null);

      router.refresh();
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Unable to update status.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

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
      (statusOverrides[report.id] ?? report.status ?? "")
        .toLowerCase()
        .includes(search);

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

  function handleReportPressStart(report: WorkReports) {
    longPressTriggered.current = false;

    // Start fill animation

    setPressingReportId(report.id);

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;

      setSelectedStatus(statusOverrides[report.id] ?? report.status ?? "DRAFT");
      setStatusError("");
      setDeleteReportError("");
      setConfirmingDelete(false);
      setActionReport(report);
    }, 750);
  }

  function handleReportPressEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);

      longPressTimer.current = null;
    }

    // Cancel/reset fill

    setPressingReportId(null);
  }

  function handleReportClick(report: WorkReports) {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;

      return;
    }

    if (actionReport) return;
    router.push(`/create-ewr?id=${report.id}`);
  }

  async function handleDeleteReport() {
    if (!actionReport) return;
    try {
      setIsDeletingReport(true);
      setDeleteReportError("");
      const response = await fetch(`/api/ewr/${actionReport.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to delete work report.");
      setActionReport(null);
      setConfirmingDelete(false);
      router.refresh();
    } catch (error) {
      setDeleteReportError(
        error instanceof Error
          ? error.message
          : "Unable to delete work report.",
      );
    } finally {
      setIsDeletingReport(false);
    }
  }

  return (
    <section className="flex h-full flex-col border-black rounded-md border-[3px] px-4 py-2">
      <div className="flex justify-between">
        <button
          type="button"

          onClick={() =>
            setTableView((current) =>
              current === "reports" ? "jobs" : "reports",
            )
          }

          className="cursor-pointer text-park-green  transition-all duration-400 ease-in-out hover:text-green-700 hover:scale-103"
        >
          <h1 className="text-3xl mb-4">
            {tableView === "reports" ? "All  Work Reports" : "All Jobs"}
          </h1>
        </button>

        <div className="flex gap-2">
          <div className="flex gap-3 text-lg text-park-gray">
            <div className="relative group ">
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

            <div className="relative group mr-5">
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

                <th className="px-3 py-1 text-center underline">Status</th>
              </tr>
            </thead>

            <tbody className="text-xl text-black">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}

                  onMouseDown={() => handleReportPressStart(report)}

                  onMouseUp={handleReportPressEnd}

                  onMouseLeave={handleReportPressEnd}

                  onTouchStart={() => handleReportPressStart(report)}

                  onTouchEnd={handleReportPressEnd}

                  onClick={() => handleReportClick(report)}

                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #A1A1A1, #A1A1A1)",

                    backgroundRepeat: "no-repeat",

                    backgroundSize:
                      pressingReportId === report.id ? "100% 100%" : "0% 100%",

                    transition:
                      pressingReportId === report.id
                        ? "background-size 700ms linear"
                        : "background-size 250ms ease-out",
                  }}

                  className={`cursor-pointer select-none border-b-2 border-park-gray transition-colors ${
                    (statusOverrides[report.id] ?? report.status ?? "DRAFT") ===
                    "SENT"
                      ? "bg-green-200 hover:bg-green-300"
                      : (statusOverrides[report.id] ??
                            report.status ??
                            "DRAFT") === "NEEDS_REVISION"
                        ? "text-red-600 hover:bg-gray-100"
                        : (statusOverrides[report.id] ??
                              report.status ??
                              "DRAFT") === "APPROVED"
                          ? "bg-yellow-300 hover:bg-yellow-200"
                          : "hover:bg-gray-100"
                  } ${pressingReportId === report.id ? "text-red-600" : ""}`}
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

                  <td className="px-3 py-3 text-center">
                    {(
                      statusOverrides[report.id] ??
                      report.status ??
                      "DRAFT"
                    ).replaceAll("_", " ")}
                  </td>
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

      <Modal
        isOpen={actionReport !== null}
        onClose={() => {
          if (isUpdatingStatus || isDeletingReport) return;
          setActionReport(null);
          setConfirmingDelete(false);
          setStatusError("");
          setDeleteReportError("");
        }}
      >
        {actionReport && (
          <div className="w-full space-y-5 rounded-lg bg-white p-6 text-center text-black">
            <h2 className="text-2xl font-bold text-park-green">
              Job {actionReport.jobNumber} — EWR #{actionReport.ewrNumber}
            </h2>

            {!confirmingDelete ? (
              <>
                <h3 className="text-xl font-bold">Update Work Report Status</h3>
                <div className="space-y-2 text-left">
                  <label
                    className="block text-lg font-semibold"
                    htmlFor="ewr-status-select"
                  >
                    Status
                  </label>
                  <select
                    id="ewr-status-select"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full rounded-md border border-gray-400 bg-white px-3 py-3"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="NEEDS_REVISION">Needs Revision</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                </div>
                {statusError && (
                  <p role="alert" className="text-sm text-red-600">
                    {statusError}
                  </p>
                )}
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => setActionReport(null)}
                    className="rounded-md border px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      isUpdatingStatus ||
                      !selectedStatus ||
                      selectedStatus ===
                        (statusOverrides[actionReport.id] ??
                          actionReport.status ??
                          "DRAFT")
                    }
                    onClick={handleUpdateStatus}
                    className="rounded-md bg-park-green px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    {isUpdatingStatus ? "Updating..." : "Update Status"}
                  </button>
                </div>
                <div className="border-t pt-4">
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => {
                      setDeleteReportError("");
                      setConfirmingDelete(true);
                    }}
                    className="w-full cursor-pointer rounded-md bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete Work Report
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-red-600">
                  Delete Work Report?
                </h3>
                <p>
                  This will permanently delete this EWR and its associated data.
                </p>
                {deleteReportError && (
                  <p role="alert" className="text-sm text-red-600">
                    {deleteReportError}
                  </p>
                )}
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    disabled={isDeletingReport}
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-md border px-4 py-2"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingReport}
                    onClick={handleDeleteReport}
                    className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    {isDeletingReport ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={editingJob !== null} onClose={() => setEditingJob(null)}>
        {editingJob && (
          <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} />
        )}
      </Modal>
    </section>
  );
}
