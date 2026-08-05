"use client";

import React from "react";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import EWRForm from "@/components/EWR/EwrForm";
import EWRPreview from "@/components/EWR/EwrPreview";
import type { EWRFormData } from "@/types/ewr.types";
import { useSearchParams } from "next/navigation";

const createId = () => crypto.randomUUID();

const initialFormData: EWRFormData = {
  recipient: "",
  jobNumber: "",
  date: "",
  jobName: "",
  description: "",

  labour: [
    {
      id: createId(),
      classification: "",
      hours: "",
      rate: "",
    },
    {
      id: createId(),
      classification: "",
      hours: "",
      rate: "",
    },
    {
      id: createId(),
      classification: "",
      hours: "",
      rate: "",
    },
  ],

  equipment: [
    {
      id: createId(),
      name: "",
      unitNumber: "",
      hours: "",
      rate: "",
    },
    {
      id: createId(),
      name: "",
      unitNumber: "",
      hours: "",
      rate: "",
    },
    {
      id: createId(),
      name: "",
      unitNumber: "",
      hours: "",
      rate: "",
    },
  ],

  materials: [
    {
      id: createId(),
      name: "",
      unit: "",
      quantity: "",
      price: "",
    },
    {
      id: createId(),
      name: "",
      unit: "",
      quantity: "",
      price: "",
    },
    {
      id: createId(),
      name: "",
      unit: "",
      quantity: "",
      price: "",
    },
  ],

  invoices: [
    {
      id: createId(),
      name: "",
      cost: "",
      markup: "10",
      amount: "",
      invoiceAttachment: null,
    },
  ],
};

export default function CreateEWR() {
  const [formData, setFormData] = useState<EWRFormData>(initialFormData);
  const searchParams = useSearchParams();

  useEffect(() => {
    const recipient = searchParams.get("to") ?? "";
    const jobNumber = searchParams.get("jobNumber") ?? "";
    const jobName = searchParams.get("jobName") ?? "";
    const date = searchParams.get("date") ?? "";

    setFormData((currentData) => ({
      ...currentData,
      recipient,
      jobNumber,
      jobName,
      date,
    }));
  }, [searchParams]);

  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0 border-r border-zinc-200 px-5 py-8 md:px-8">
            <EWRForm formData={formData} setFormData={setFormData} />
          </section>

          <aside className="bg-zinc-50 px-5 py-8 md:px-7">
            <div className="xl:sticky xl:top-6">
              <EWRPreview formData={formData} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
