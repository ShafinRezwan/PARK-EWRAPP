"use client";

type Props = {
  onClose: () => void;
};

export default function CreateJobModal({ onClose }: Props) {
  return (
    <>
      <div className="grid grid-cols-[180px_1fr_150px] gap-6">
        <div>
          <label className="mb-2 block text-2xl font-bold">Job #</label>

          <input className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl" />
        </div>

        <div>
          <label className="mb-2 block text-2xl font-bold">Job Name</label>

          <input className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl" />
        </div>

        <div>
          <label className="mb-2 block text-2xl font-bold">Year</label>

          <input className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl" />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button className="rounded-md bg-park-green px-20 py-3 text-2xl cursor-pointer hover:bg-park-green-dark text-white transition-all duration-300">
          Submit
        </button>
      </div>
    </>
  );
}
