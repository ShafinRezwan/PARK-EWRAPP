"use client";

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
            <PopoverTrigger>
              <Button
                variant="outline"
                className="w-full justify-between rounded-md border-[3px] border-black py-6 text-xl font-normal"
              >
                {date ? format(date, "MMM dd, yyyy") : "Pick a date"}

                <CalendarIcon className="h-5 w-5 opacity-70" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
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
