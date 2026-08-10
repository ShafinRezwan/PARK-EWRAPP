"use client";
import PageTransition from "./PageTransition";
import { divisions } from "@/types/ewr.types";
type Props = {
  onClose: () => void;
};

export default function createJobModal({ onClose }: Props) {
  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 2019 },
    (_, i) => currentYear - i,
  );

  return (
    <>
      <PageTransition>
        <div className="grid grid-cols-6 gap-6">
          <div>
            <label className="mb-2 block text-2xl font-bold">Job #</label>

            <input
              placeholder="26-012"
              className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
            />
          </div>

          <div className="col-span-3">
            <label className="mb-2 block text-2xl font-bold">Job Name</label>

            <input className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl" />
          </div>
          <div>
            <label className="mb-2 block text-2xl font-bold">Division</label>

            <select className="w-full rounded-md border-[3px] border-black bg-white px-3 py-2 text-xl">
              {divisions.map((division) => (
                <option key={division.code} value={division.code}>
                  {division.code} - {division.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-2xl font-bold">Year</label>

            <select className="w-full rounded-md border-[3px] border-black bg-white px-3 py-2 text-xl">
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button className=" w-full rounded-md bg-park-green px-20 py-3 text-2xl cursor-pointer hover:bg-park-green-dark text-white transition-all duration-300">
            Submit
          </button>
        </div>
      </PageTransition>
    </>
  );
}
