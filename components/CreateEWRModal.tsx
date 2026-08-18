"use client";

import PageTransition from "./PageTransition";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import type { Job } from "@/lib/jobs";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  onClose: () => void;
  jobs: Job[];
};

export default function CreateEWRModal({ jobs, onClose }: Props) {
  const router = useRouter();

  const [to, setTo] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [jobName, setJobName] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [jobId, setJobId] = useState("");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);

  const matchingJobs = jobs
    .filter((job) => {
      const search = jobNumber.toLowerCase().trim();

      if (!search) return false;

      return (
        job.jobNumber.toLowerCase().includes(search) ||
        job.jobName.toLowerCase().includes(search)
      );
    })
    .slice(0, 8);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams({
      jobId,
      to,
      jobNumber,
      jobName,
      date: date ? format(date, "yyyy-MM-dd") : "",
    });

    router.push(`/create-ewr?${params.toString()}`);

    onClose();
  }

  return (
    <PageTransition>
      <form onSubmit={handleSubmit}>
        <h1 className="mb-8 text-center text-4xl font-bold text-park-green underline">
          CREATE EWR
        </h1>

        <div className="grid grid-cols-6 gap-4">
          {/* TO */}
          <div className="col-span-2">
            <label className="mb-2 block text-2xl font-bold">To:</label>

            <input
              value={to}
              onChange={(event) => {
                setJobNumber(event.target.value);
                setJobId("");
                setJobName("");
                setTo("");

                setJobDropdownOpen(true);
              }}
              className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
            />
          </div>

          {/* JOB NUMBER */}
          <div className="relative col-span-1">
            <label className="mb-2 block text-2xl font-bold">Job #</label>

            <input
              value={jobNumber}
              onFocus={() => setJobDropdownOpen(true)}
              onChange={(event) => {
                setJobNumber(event.target.value);

                // Clear previously selected job info
                setJobId("");
                setJobName("");
                setTo("");

                setJobDropdownOpen(true);
              }}
              placeholder="26-012"
              className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
            />

            {/* JOB SEARCH RESULTS */}
            {jobDropdownOpen && jobNumber && matchingJobs.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-[450px] overflow-y-auto rounded-md border-2 border-black bg-white shadow-xl">
                {matchingJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      setJobId(job.id);
                      setJobNumber(job.jobNumber);
                      setJobName(job.jobName);
                      setTo(job.recipient ?? "");

                      setJobDropdownOpen(false);
                    }}
                    className="block w-full border-b px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-100"
                  >
                    <div className="font-semibold">
                      {job.jobNumber} — {job.jobName}
                    </div>

                    <div className="text-sm text-gray-500">
                      Division {job.division}
                      {job.recipient ? ` · ${job.recipient}` : ""}
                      {job.year ? ` - ${job.year}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* JOB NAME */}
          <div className="col-span-2">
            <label className="mb-2 block text-2xl font-bold">Job Name</label>

            <input
              value={jobName}
              readOnly
              className="w-full rounded-md border-[3px] border-black bg-gray-100 px-3 py-2 text-xl"
            />
          </div>

          {/* DATE */}
          <div className="col-span-1">
            <label className="mb-2 block text-2xl font-bold">Date</label>

            <Popover>
              <PopoverTrigger
                type="button"
                className="flex h-12 w-full items-center justify-between rounded-md border-[3px] border-black bg-white px-4 text-lg font-normal"
              >
                <span>{date ? format(date, "MM/dd/yy") : "Date"}</span>

                <CalendarIcon className="h-5 w-5 shrink-0 opacity-70" />
              </PopoverTrigger>

              <PopoverContent
                align="end"
                sideOffset={8}
                className="z-100 w-auto rounded-md border border-zinc-200 bg-white p-0 shadow-lg"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-auto p-3 text-sm"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={!jobId || !jobNumber || !jobName || !date}
            className="w-full cursor-pointer rounded-md bg-park-green px-20 py-3 text-2xl text-white transition-all duration-300 hover:bg-park-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </form>
    </PageTransition>
  );
}
