"use client";
import PageTransition from "./PageTransition";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  onClose: () => void;
};

export default function CreateEWRModal({ onClose }: Props) {
  const router = useRouter();

  const [to, setTo] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [jobName, setJobName] = useState("");
  const [date, setDate] = useState<Date>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams({
      to,
      jobNumber,
      jobName,
      date: date ? format(date, "yyyy-MM-dd") : "",
    });

    onClose();

    router.push(`/create-ewr?${params.toString()}`);
  }

  return (
    <PageTransition>
      <form onSubmit={handleSubmit}>
        <h1 className="text-3xl text-park-green font-bold pb-2 underline  text-center">
          CREATE EWR
        </h1>
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <label className="mb-2 block text-2xl font-bold">To:</label>

            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-2 block text-2xl font-bold">Job #</label>

            <input
              value={jobNumber}
              onChange={(event) => setJobNumber(event.target.value)}
              placeholder="26-012"
              className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
            />
          </div>

          <div className="col-span-2">
            <label className="mb-2 block text-2xl font-bold">Job Name</label>

            <input
              value={jobName}
              onChange={(event) => setJobName(event.target.value)}
              className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-2 block text-2xl font-bold">Date</label>

            <Popover>
              <PopoverTrigger>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12.5 w-full justify-between whitespace-nowrap rounded-md border-[3px] border-black px-3 py-0 text-base font-normal"
                >
                  <span>
                    {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
                  </span>

                  <CalendarIcon className="h-5 w-5 shrink-0 opacity-70" />
                </Button>
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
            className="w-full cursor-pointer rounded-md bg-park-green px-20 py-3 text-2xl text-white transition-all duration-300 hover:bg-park-green-dark"
          >
            Submit
          </button>
        </div>
      </form>
    </PageTransition>
  );
}
