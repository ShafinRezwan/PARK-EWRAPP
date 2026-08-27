"use client";

import { useState } from "react";

import Sidebar from "@/components/sidebar";
import EWRForm from "@/components/EWR/EwrForm";
import EWRPreview from "@/components/EWR/EwrPreview";

import type { EWRFormData } from "@/types/ewr.types";
import type { LabourRate, EquipmentRate, MaterialRate } from "@/lib/rates";
import type { Job } from "@/lib/jobs";

const createId = () => crypto.randomUUID();

const initialFormData: EWRFormData = {
  jobId: "",
  recipient: "",
  jobNumber: "",
  date: "",
  jobName: "",
  description: "",
  ewrNumber: "",
  address: "",

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
      amount: "",
      invoiceAttachment: null,
    },
  ],
  invoiceMarkups: [],
};

type Props = {
  labourRates: LabourRate[];
  equipmentRates: EquipmentRate[];
  materialRates: MaterialRate[];
  jobs: Job[];

  existingReport: EWRFormData | null;
  reportId: string | null;
  ewrNumber: string | null;

  initialParams: {
    jobId: string;
    recipient: string;
    jobNumber: string;
    jobName: string;
    date: string;
    address: string;
  } | null;
};

export default function CreateEWRClient({
  labourRates,
  jobs,
  equipmentRates,
  materialRates,
  existingReport,
  reportId,
  initialParams,
  ewrNumber,
}: Props) {
  const [ewrNumberError, setEwrNumberError] = useState("");

  const [formData, setFormData] = useState<EWRFormData>(() => {
    // Opening a saved EWR
    if (existingReport) {
      return {
        ...existingReport,
        ewrNumber: existingReport.ewrNumber || ewrNumber || "",
        invoiceMarkups: existingReport.invoiceMarkups ?? [],
      };
    }

    // Creating a new EWR from the modal
    if (initialParams) {
      return {
        ...initialFormData,
        jobId: initialParams.jobId,
        recipient: initialParams.recipient,
        jobNumber: initialParams.jobNumber,
        jobName: initialParams.jobName,
        date: initialParams.date,
        address: initialParams.address,
        ewrNumber: ewrNumber ?? "",
      };
    }

    return {
      ...initialFormData,
      ewrNumber: ewrNumber ?? "",
    };
  });

  return (
    <div className="flex min-h-screen bg-white">
      <div className="grid min-w-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_440px] 2xl:grid-cols-[minmax(0,1fr)_500px]">
        <main className="min-w-0 px-6 py-8 md:px-8">
          <EWRForm
            formData={formData}
            setFormData={setFormData}
            labourRates={labourRates}
            jobs={jobs}
            equipmentRates={equipmentRates}
            materialRates={materialRates}
            reportId={reportId}
            ewrNumberError={ewrNumberError}
            setEwrNumberError={setEwrNumberError}
          />
        </main>

        <aside className="border-l border-zinc-200 bg-zinc-50 px-4 py-8">
          <div className="mx-auto w-full max-w-[470px] xl:sticky xl:top-6">
            <EWRPreview
              formData={formData}
              reportId={reportId}
              ewrNumber={ewrNumberError}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
