"use client";
import PageTransition from "./PageTransition";
import { useState } from "react";
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

export default function CreateTaskModal({ onClose }: Props) {
  const [date, setDate] = useState<Date>();
  return (
    <>
      <PageTransition>
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

            <Popover>
              <PopoverTrigger
                type="button"
                className="flex h-12 w-full items-center justify-between rounded-md border-[3px] border-black bg-white px-4 text-l font-normal"
              >
                <span>
                  {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
                </span>

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
          <button className=" w-full rounded-md bg-park-green px-20 py-3 text-2xl font-bold text-white cursor-pointer hover:bg-park-green-dark transition-all duration-300">
            Submit
          </button>
        </div>
      </PageTransition>
    </>
  );
}
