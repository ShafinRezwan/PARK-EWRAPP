import React from "react";

export default function SearchBar() {
  return (
    <>
      <label className="sr-only" htmlFor="search">
        Search jobs and work reports
      </label>
      <input
        id="dashboard-search"
        type="search"
        placeholder="Search"
        className="w-full max-w-sm rounded-md border-[3px] border-black px-3 py-2 text-xl text-park-gray outline-none transition focus:border-park-green"
      />
    </>
  );
}
