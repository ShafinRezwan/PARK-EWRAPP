"use client";

type Props = {
  onClose: () => void;
};

export default function CreateTaskModal({ onClose }: Props) {
  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-2 ">
          <label className="mb-2 block text-2xl font-bold">Task</label>

          <input className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl" />
        </div>

        <div>
          <label className="mb-2 block text-2xl font-bold">Job #</label>

          <input className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl" />
        </div>

        <div>
          <label className="mb-2 block text-2xl font-bold">Due</label>

          <input className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl" />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button className="rounded-md bg-park-green px-20 py-3 text-2xl font-bold text-white cursor-pointer hover:bg-park-green-dark transition-all duration-300">
          Submit
        </button>
      </div>
    </>
  );
}
