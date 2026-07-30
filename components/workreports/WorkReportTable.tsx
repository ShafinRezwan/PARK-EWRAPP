import React, { useState } from "react";
import Link from "next/link";

type WorkReports = {
  id: number;
  jobNumber: string;
  jobName: string;
  ewrNumber: string;
  dateOfWork: string;
  status: "Sent" | "Pending";
  divisionCode: string;
  year: number;
};

//Will replace to be dynamic later
const reports: WorkReports[] = [
  {
    id: 1,
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Sent",
    divisionCode: "01",
    year: 2026,
  },
  {
    id: 2,
    jobNumber: "25-042",
    jobName: "Orchards 44",
    ewrNumber: "9841",
    dateOfWork: "05/12/2026",
    status: "Pending",
    divisionCode: "03",
    year: 2026,
  },
  {
    id: 3,
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Sent",
    divisionCode: "01",
    year: 2026,
  },
  {
    id: 4,
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Pending",
    divisionCode: "01",
    year: 2026,
  },
  {
    id: 5,
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Pending",
    divisionCode: "01",
    year: 2026,
  },
  {
    id: 6,
    jobNumber: "25-050",
    jobName: "Hillshire West Stage 1",
    ewrNumber: "9801",
    dateOfWork: "06/14/2026",
    status: "Sent",
    divisionCode: "01",
    year: 2026,
  },
  {
    id: 7,
    jobNumber: "25-042",
    jobName: "Orchards 44",
    ewrNumber: "9841",
    dateOfWork: "05/12/2026",
    status: "Pending",
    divisionCode: "01",
    year: 2025,
  },
];

const divisions = ["All", "01", "03", "09", "10", "41", "42", "43", "90"];

const filterLinks = "underline text-park-gray";

export default function WorkReportTable() {
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectYear, setSelectYear] = useState(new Date().getFullYear());

  const filteredReports = reports.filter((report) => {
    const matchesDivision =
      selectedDivision === "All" || report.divisionCode === selectedDivision;

    const matchesYear =
      selectYear === new Date().getFullYear() || report.year === selectYear;

    return matchesDivision && matchesYear;
  });

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 2019 },
    (_, i) => currentYear - i,
  );

  return (
    <section className="flex min-h-0 flex-col border-black rounded-md border-[3px] px-4 py-2">
      <div className="flex justify-between">
        <h1 className="text-park-green text-3xl mb-4">All Work Reports</h1>
        <div className="flex gap-2">
          <div className="flex gap-3 text-lg text-park-gray">
            <div className="relative group">
              <button type="button" className="underline">
                Division
              </button>

              <div className=" pointer-events-none absolute right-0 z-50  max-h-0 -translate-y-2 overflow-hidden rounded-md border-2 border-black bg-white py-0 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:max-h-125 group-hover:translate-y-0  group-hover:opacity-100">
                {divisions.map((division) => (
                  <button
                    key={division}
                    type="button"
                    onClick={() => setSelectedDivision(division)}
                    className={`block w-full px-5 py-2 text-left ${
                      selectedDivision === division
                        ? "bg-park-green text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {division}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button type="button" className="underline">
                Year
              </button>

              <div className=" pointer-events-none absolute -right-6 z-50  max-h-0 -translate-y-2 overflow-hidden rounded-md border-2 border-black bg-white py-0 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:max-h-125 group-hover:translate-y-0  group-hover:opacity-100">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectYear(year)}
                    className={`block w-full px-5 py-2 text-left ${
                      selectYear === year
                        ? "bg-park-green text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button type="button" className="underline">
                Recent
              </button>
            </div>
          </div>
        </div>
      </div>
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
            {filteredReports.map((report, index) => (
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
