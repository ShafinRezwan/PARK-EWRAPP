"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/sidebar";
import EWRForm from "@/components/EWR/EwrForm";
import EWRPreview from "@/components/EWR/EwrPreview";

import type { EWRFormData } from "@/types/ewr.types";
import type { LabourRate, EquipmentRate, MaterialRate } from "@/lib/rates";

const createId = () => crypto.randomUUID();

const initialFormData: EWRFormData = {
  recipient: "",
  jobNumber: "",
  date: "",
  jobName: "",
  description: "",
  ewrNumber: "",

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

type Props = {
  labourRates: LabourRate[];
  equipmentRates: EquipmentRate[];
  materialRates: MaterialRate[];

  existingReport: EWRFormData | null;
  reportId: string | null;
  ewrNumber: string | null;

  initialParams: {
    recipient: string;
    jobNumber: string;
    jobName: string;
    date: string;
  } | null;
};

export default function CreateEWRClient({
  labourRates,
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
      };
    }

    // Creating a new EWR from the modal
    if (initialParams) {
      return {
        ...initialFormData,
        recipient: initialParams.recipient,
        jobNumber: initialParams.jobNumber,
        jobName: initialParams.jobName,
        date: initialParams.date,
        ewrNumber: ewrNumber ?? "",
      };
    }

    return {
      ...initialFormData,
      ewrNumber: ewrNumber ?? "",
    };
  });

  return (
    <div className="min-w-0 flex-1">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0 border-r border-zinc-200 px-5 py-8 md:px-8">
          <EWRForm
            formData={formData}
            setFormData={setFormData}
            labourRates={labourRates}
            equipmentRates={equipmentRates}
            materialRates={materialRates}
            reportId={reportId}
            ewrNumberError={ewrNumberError}
            setEwrNumberError={setEwrNumberError}
          />
        </section>

        <aside className="bg-zinc-50 px-5 py-8 md:px-7">
          <div className="xl:sticky xl:top-6">
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
