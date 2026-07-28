import React from "react";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-6">
      <label className="sr-only" htmlFor="dashboard-search">
        Search jobs and work reports
      </label>
      <input
        id="dashboard-search"
        type="search"
        placeholder="Search"
        className="w-full max-w-sm rounded-md border-[3px] border-black px-3 py-2 text-xl text-park-gray outline-none transition focus:border-park-green"
      />

      <Link
        href="/jobs/create"
        className="shrink-0 rounded-md border-[3px] border-park-green bg-park-green px-10 py-2 text-xl  text-white transition hover:bg-green-800 hover:border-green-800"
      >
        Create New Job
      </Link>
    </header>
  );
}
