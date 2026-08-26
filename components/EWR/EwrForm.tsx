"use client";

import {
  type Dispatch,
  type SetStateAction,
  type ReactNode,
  useState,
} from "react";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Job } from "@/lib/jobs";

import type {
  EWRFormData,
  LabourFormRow,
  EquipmentFormRow,
  MaterialFormRow,
  InvoiceFormRow,
  InvoiceAttachment,
} from "../../types/ewr.types.js";

import { LabourRate, EquipmentRate, MaterialRate } from "@/lib/rates.js";

type EWRFormProps = {
  formData: EWRFormData;
  setFormData: Dispatch<SetStateAction<EWRFormData>>;
  jobs: Job[];
  labourRates: LabourRate[];
  equipmentRates: EquipmentRate[];
  materialRates: MaterialRate[];
  reportId: string | null;

  ewrNumberError: string;
  setEwrNumberError: Dispatch<SetStateAction<string>>;
};

type SectionHeaderProps = {
  title: string;
  onAdd: () => void;
  disabled?: boolean;
};

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

const createId = () => crypto.randomUUID();

const inputClassName =
  "h-10 w-full rounded-md border-2 border-black bg-white px-3 text-base outline-none transition focus:border-park-green focus:ring-2 focus:ring-green-100";

const compactInputClassName =
  "h-9 w-full rounded-md border-2 border-black bg-white px-2 text-sm outline-none transition focus:border-park-green focus:ring-2 focus:ring-green-100";

const labourGrid = "md:grid-cols-[minmax(150px,2fr)_90px_90px_110px_40px]";

const equipmentGrid =
  "md:grid-cols-[minmax(150px,2fr)_90px_90px_90px_110px_40px]";

const invoiceGrid =
  "md:grid-cols-[minmax(150px,2fr)_90px_90px_90px_150px_50px]";

function SectionHeader({ title, onAdd, disabled = false }: SectionHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between rounded-md bg-park-green">
      <h2 className="px-3 text-lg font-semibold text-white">{title}</h2>

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="h-full rounded-r-md bg-park-green px-6 text-base font-semibold text-white transition hover:bg-park-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add Row +
      </button>
    </div>
  );
}

function Field({ label, children, className = "" }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-base font-semibold">{label}</span>

      {children}
    </label>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove row"
      className="flex h-9 w-9 items-center justify-center text-xl font-bold text-red-600 transition hover:scale-110 hover:text-red-700"
    >
      ×
    </button>
  );
}

function CurrencyAmount({ amount }: { amount: number }) {
  return (
    <p className="whitespace-nowrap text-base font-semibold text-park-green">
      ${amount.toFixed(2)}
    </p>
  );
}

function calculateAmount(quantity: string, rate: string) {
  const parsedQuantity = Number(quantity) || 0;
  const parsedRate = Number(rate) || 0;

  return parsedQuantity * parsedRate;
}

export default function EWRForm({
  formData,
  setFormData,
  jobs,
  labourRates,
  equipmentRates,
  materialRates,
  reportId,
  ewrNumberError,
  setEwrNumberError,
}: EWRFormProps) {
  const updateMainField = (
    field: keyof Pick<
      EWRFormData,
      | "recipient"
      | "jobNumber"
      | "ewrNumber"
      | "date"
      | "address"
      | "jobName"
      | "description"
    >,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);

  const updateLabourRow = (
    id: string,
    field: keyof Omit<LabourFormRow, "id">,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      labour: current.labour.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const updateEquipmentRow = (
    id: string,
    field: keyof Omit<EquipmentFormRow, "id">,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      equipment: current.equipment.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const updateMaterialRow = (
    id: string,
    field: keyof Omit<MaterialFormRow, "id">,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      materials: current.materials.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const updateInvoiceRow = (
    id: string,
    field: keyof Omit<InvoiceFormRow, "id" | "invoiceAttachment">,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      invoices: current.invoices.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const acceptedInvoiceTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maximumInvoiceSize = 10 * 1024 * 1024;

  const uploadInvoiceAttachment = (
    invoiceId: string,
    file: File | undefined,
  ) => {
    if (!file) return;

    if (!acceptedInvoiceTypes.includes(file.type)) {
      alert("Please upload a PDF, JPG, PNG, or WEBP invoice.");
      return;
    }

    if (file.size > maximumInvoiceSize) {
      alert("The invoice file must be 10 MB or smaller.");
      return;
    }

    const attachment: InvoiceAttachment = {
      id: createId(),
      file,
      fileName: file.name,
      fileType: file.type,
      previewUrl: URL.createObjectURL(file),
    };

    setFormData((current): EWRFormData => ({
      ...current,
      invoices: current.invoices.map((invoice): InvoiceFormRow => {
        if (invoice.id !== invoiceId) {
          return invoice;
        }

        if (invoice.invoiceAttachment?.previewUrl) {
          URL.revokeObjectURL(invoice.invoiceAttachment.previewUrl);
        }

        return {
          ...invoice,
          invoiceAttachment: attachment,
        };
      }),
    }));
  };

  const removeInvoiceAttachment = (invoiceId: string) => {
    setFormData((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) => {
        if (invoice.id !== invoiceId) {
          return invoice;
        }

        if (invoice.invoiceAttachment?.previewUrl) {
          URL.revokeObjectURL(invoice.invoiceAttachment.previewUrl);
        }

        return {
          ...invoice,
          invoiceAttachment: null,
        };
      }),
    }));
  };

  const [openLabourDropdown, setOpenLabourDropdown] = useState<string | null>(
    null,
  );

  const [openEquipDropdown, setOpenEquipdDropdown] = useState<string | null>(
    null,
  );

  const [openMaterialDropdown, setOpenMaterialDropdown] = useState<
    string | null
  >(null);

  const removeRow = (
    section: "labour" | "equipment" | "materials" | "invoices",
    id: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [section]: current[section].filter((row) => row.id !== id),
    }));
  };

  const MAX_LABOUR_ROWS = 14;
  const MAX_EQUIPMENT_ROWS = 10;
  const MAX_MATERIAL_ROWS = 6;
  const MAX_INVOICE_ROWS = 6;

  const addLabourRow = () => {
    setFormData((current) => {
      if (current.labour.length >= MAX_LABOUR_ROWS) {
        return current;
      }

      return {
        ...current,
        labour: [
          ...current.labour,
          {
            id: createId(),
            classification: "",
            hours: "",
            rate: "",
          },
        ],
      };
    });
  };

  const checkEwrNumber = async (ewrNumber: string) => {
    if (!ewrNumber.trim() || !formData.jobNumber.trim()) {
      setEwrNumberError("");
      return;
    }

    try {
      const response = await fetch("/api/ewr/check-number", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          jobId: formData.jobId,
          ewrNumber,
          reportId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to check EWR number.");
      }

      if (result.exists) {
        setEwrNumberError(
          `EWR #${ewrNumber} already exists for Job ${formData.jobNumber}.`,
        );
      } else {
        setEwrNumberError("");
      }
    } catch (error) {
      console.error("EWR number check failed:", error);
    }
  };

  const getLabourMatches = (searchValue: string) => {
    const search = searchValue.toLowerCase().trim();

    if (!search) return [];

    return labourRates
      .filter((worker) => {
        const employeeNumber = worker.employeeNumber.toString();
        const workClass = worker.baseWorkClass.toLowerCase();
        const className = worker.baseClassName.toLowerCase();

        return (
          employeeNumber.includes(search) ||
          workClass.includes(search) ||
          className.includes(search)
        );
      })
      .slice(0, 8);
  };

  const addEquipmentRow = () => {
    setFormData((current) => {
      if (current.equipment.length >= MAX_EQUIPMENT_ROWS) {
        return current;
      }

      return {
        ...current,
        equipment: [
          ...current.equipment,
          {
            id: createId(),
            name: "",
            unitNumber: "",
            hours: "",
            rate: "",
          },
        ],
      };
    });
  };

  const getEquipMatches = (searchValue: string) => {
    const search = searchValue.toLowerCase().trim();

    if (!search) return [];

    return equipmentRates
      .filter((equipment) => {
        const equipmentNumber = equipment.equipmentNumber.toLowerCase();

        const description = equipment.description.toLowerCase();

        const makeModelYear = equipment.makeModelYear.toLowerCase();

        return (
          equipmentNumber.includes(search) ||
          description.includes(search) ||
          makeModelYear.includes(search)
        );
      })
      .slice(0, 8);
  };

  const addMaterialRow = () => {
    setFormData((current) => {
      if (current.materials.length >= MAX_MATERIAL_ROWS) {
        return current;
      }

      return {
        ...current,
        materials: [
          ...current.materials,
          {
            id: createId(),
            name: "",
            unit: "",
            quantity: "",
            price: "",
          },
        ],
      };
    });
  };

  const getMaterialMatches = (searchValue: string) => {
    const search = searchValue.toLowerCase().trim();

    if (!search) return [];

    return materialRates
      .filter((material) => {
        return (
          material.type.toLowerCase().includes(search) ||
          material.unit.toLowerCase().includes(search)
        );
      })
      .slice(0, 8);
  };

  const addInvoiceRow = () => {
    setFormData((current) => {
      if (current.invoices.length >= MAX_INVOICE_ROWS) {
        return current;
      }

      return {
        ...current,
        invoices: [
          ...current.invoices,
          {
            id: createId(),
            name: "",
            cost: "",
            markup: "",
            amount: "",
            invoiceAttachment: null,
          },
        ],
      };
    });
  };

  const getJobMatches = (searchValue: string) => {
    const search = searchValue.toLowerCase().trim();

    if (!search) return [];

    return jobs
      .filter((job) => {
        const jobNumber = job.jobNumber.toLowerCase();
        const jobName = job.jobName.toLowerCase();
        const year = String(job.year);

        return (
          jobNumber.includes(search) ||
          jobName.includes(search) ||
          year.includes(search)
        );
      })
      .slice(0, 8);
  };
  const jobMatches = getJobMatches(formData.jobNumber);
  const parseLocalDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="mx-auto w-full max-w-4xl space-y-7"
    >
      <section className="space-y-3">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
          <Field label="To:" className="col-span-3">
            <input
              value={formData.recipient}
              onChange={(event) =>
                updateMainField("recipient", event.target.value)
              }
              className={inputClassName}
            />
          </Field>

          <div className="relative">
            <Field label="Job #:">
              <input
                value={formData.jobNumber}
                onFocus={() => setJobDropdownOpen(true)}
                onChange={(event) => {
                  const value = event.target.value;

                  setFormData((current) => ({
                    ...current,

                    // User is searching again, so the old selected
                    // database Job should no longer remain attached.
                    jobId: "",
                    jobNumber: value,
                    jobName: "",
                    address: "",
                    recipient: "",
                  }));

                  setEwrNumberError("");
                  setJobDropdownOpen(true);
                }}
                placeholder="Job # or job name"
                className={inputClassName}
              />
            </Field>

            {jobDropdownOpen && formData.jobNumber && jobMatches.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-[450px] overflow-y-auto rounded-md border-2 border-black bg-white shadow-xl">
                {jobMatches.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      console.log("JOB:", job);
                      console.log("ADDRESS:", job.address);
                      setFormData((current) => ({
                        ...current,

                        jobId: job.id,
                        jobNumber: job.jobNumber,
                        jobName: job.jobName,
                        address: job.address ?? "",
                        recipient: job.recipient ?? "",
                      }));

                      setEwrNumberError("");
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
                      <span className="text-park-green italic">
                        {job.year ? ` · ${job.year}` : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Field label="EWR #:">
            <input
              type="number"
              min="9801"
              value={formData.ewrNumber}
              onChange={(event) => {
                const value = event.target.value;

                updateMainField("ewrNumber", value);

                checkEwrNumber(value);
              }}
              className={`${inputClassName} ${
                ewrNumberError ? "border-red-600 focus:border-red-600" : ""
              }`}
            />

            {ewrNumberError && (
              <p className="mt-1 text-sm font-semibold text-red-600">
                {ewrNumberError}
              </p>
            )}
          </Field>

          <Field label="Date:">
            <Popover>
              <PopoverTrigger
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border-2 border-black bg-white px-3 text-base"
              >
                <span className="text-base">
                  {formData.date
                    ? format(parseLocalDate(formData.date), "MM/dd/yy")
                    : "Date"}
                </span>
                <CalendarIcon className="h-5 w-5 opacity-70" />
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={
                    formData.date ? parseLocalDate(formData.date) : undefined
                  }
                  onSelect={(selectedDate) => {
                    updateMainField(
                      "date",
                      selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
                    );
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>
        </div>

        <Field label="Job Name:">
          <input
            value={formData.jobName}
            onChange={(event) => updateMainField("jobName", event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Address:">
          <input
            value={formData.address}
            placeholder="Street Address, City, Province Postal Code"
            onChange={(event) => updateMainField("address", event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Description:">
          <textarea
            value={formData.description}
            onChange={(event) =>
              updateMainField("description", event.target.value)
            }
            className="min-h-28 w-full resize-y rounded-md border-2 border-black bg-white p-3 text-base outline-none transition focus:border-park-green focus:ring-2 focus:ring-park-green"
          />
        </Field>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Labour"
          onAdd={addLabourRow}
          disabled={formData.labour.length >= MAX_LABOUR_ROWS}
        />

        <div className="space-y-3">
          <div
            className={`hidden md:grid ${labourGrid} gap-3 font-bold underline`}
          >
            <span className="text-left pl-1">Classification</span>
            <span className="text-center ">Hours</span>
            <span className="text-center ">Rate</span>
            <span className="text-center ">Amount</span>
          </div>

          {formData.labour.map((row) => {
            const matches = getLabourMatches(row.classification);

            return (
              <div
                key={row.id}
                className={`grid grid-cols-1 items-center gap-3 rounded-md border border-zinc-200 p-3 ${labourGrid} md:border-0 md:p-0`}
              >
                <div className="relative">
                  <Field label="Classification" className="md:[&>span]:hidden">
                    <input
                      value={row.classification}
                      onFocus={() => setOpenLabourDropdown(row.id)}
                      onChange={(event) => {
                        updateLabourRow(
                          row.id,
                          "classification",
                          event.target.value,
                        );
                        setOpenLabourDropdown(row.id);
                      }}
                      placeholder="Employee #, class, or classification"
                      className={compactInputClassName}
                    />
                  </Field>

                  {openLabourDropdown === row.id &&
                    row.classification &&
                    matches.length > 0 && (
                      <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border-2 border-black bg-white shadow-lg">
                        {matches.map((worker) => (
                          <button
                            key={worker.id}
                            type="button"
                            onClick={() => {
                              setFormData((current) => ({
                                ...current,
                                labour: current.labour.map((labourRow) =>
                                  labourRow.id === row.id
                                    ? {
                                        ...labourRow,
                                        classification: worker.baseClassName,
                                        rate: worker.rate.toString(),
                                      }
                                    : labourRow,
                                ),
                              }));
                              setOpenLabourDropdown(null);
                            }}
                            className="w-full border-b px-3 py-2 text-left transition last:border-b-0 hover:bg-gray-100"
                          >
                            <div className="font-semibold">
                              {worker.baseClassName}
                            </div>

                            <div className="text-sm text-gray-500">
                              #{worker.employeeNumber} · {worker.baseWorkClass}{" "}
                              · ${worker.rate.toFixed(2)}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <Field label="Hours" className="md:[&>span]:hidden">
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={row.hours}
                    onChange={(event) =>
                      updateLabourRow(row.id, "hours", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>

                <Field label="Rate" className="md:[&>span]:hidden">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.rate}
                    onChange={(event) =>
                      updateLabourRow(row.id, "rate", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>

                <div className="text-center">
                  <CurrencyAmount
                    amount={calculateAmount(row.hours, row.rate)}
                  />
                </div>

                <RemoveButton onClick={() => removeRow("labour", row.id)} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Equipment & Rented Trucks"
          onAdd={addEquipmentRow}
          disabled={formData.equipment.length >= MAX_EQUIPMENT_ROWS}
        />

        <div className="space-y-3">
          <div
            className={`hidden md:grid ${equipmentGrid} gap-3 font-bold underline`}
          >
            <span className="text-left pl-1">Name</span>
            <span className="text-center">Unit No.</span>
            <span className="text-center">Hours</span>
            <span className="text-center">Rate</span>
            <span className="text-center">Amount</span>
            <span />
          </div>

          {formData.equipment.map((row) => {
            const matches = getEquipMatches(row.name);

            return (
              <div
                key={row.id}
                className={`grid grid-cols-1 items-center gap-3 rounded-md border border-zinc-200 p-3 ${equipmentGrid} md:border-0 md:p-0`}
              >
                {/* Equipment search */}
                <div className="relative">
                  <Field label="Name" className="md:[&>span]:hidden">
                    <input
                      value={row.name}
                      onFocus={() => setOpenEquipdDropdown(row.id)}
                      onChange={(event) => {
                        updateEquipmentRow(row.id, "name", event.target.value);

                        setOpenEquipdDropdown(row.id);
                      }}
                      placeholder="Equipment # or Description"
                      className={compactInputClassName}
                    />
                  </Field>

                  {openEquipDropdown === row.id &&
                    row.name &&
                    matches.length > 0 && (
                      <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border-2 border-black bg-white shadow-lg">
                        {matches.map((equip) => (
                          <button
                            key={equip.id}
                            type="button"
                            onClick={() => {
                              setFormData((current) => ({
                                ...current,
                                equipment: current.equipment.map((equipRow) =>
                                  equipRow.id === row.id
                                    ? {
                                        ...equipRow,
                                        name: equip.description,
                                        unitNumber: equip.equipmentNumber,
                                        rate: equip.rate.toString(),
                                      }
                                    : equipRow,
                                ),
                              }));

                              setOpenEquipdDropdown(null);
                            }}
                            className="w-full border-b px-3 py-2 text-left transition last:border-b-0 hover:bg-gray-100"
                          >
                            <div className="font-semibold">
                              {equip.description}
                            </div>

                            <div className="text-sm text-gray-500">
                              #{equip.equipmentNumber} · {equip.makeModelYear} ·
                              ${equip.rate.toFixed(2)}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Unit Number */}
                <Field label="Unit No." className="md:[&>span]:hidden">
                  <input
                    value={row.unitNumber}
                    onChange={(event) =>
                      updateEquipmentRow(
                        row.id,
                        "unitNumber",
                        event.target.value,
                      )
                    }
                    className={compactInputClassName}
                  />
                </Field>

                {/* Hours */}
                <Field label="Hours" className="md:[&>span]:hidden">
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={row.hours}
                    onChange={(event) =>
                      updateEquipmentRow(row.id, "hours", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>

                {/* Rate */}
                <Field label="Rate" className="md:[&>span]:hidden">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.rate}
                    onChange={(event) =>
                      updateEquipmentRow(row.id, "rate", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>

                {/* Amount */}
                <div className="text-center">
                  <CurrencyAmount
                    amount={calculateAmount(row.hours, row.rate)}
                  />
                </div>

                {/* Remove */}
                <RemoveButton onClick={() => removeRow("equipment", row.id)} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Materials"
          onAdd={addMaterialRow}
          disabled={formData.materials.length >= MAX_MATERIAL_ROWS}
        />

        <div className="space-y-3">
          <div
            className={`hidden md:grid ${equipmentGrid} gap-3 font-bold underline`}
          >
            <span className="text-left pl-1">Name</span>
            <span className="text-center">Unit</span>
            <span className="text-center">Quantity</span>
            <span className="text-center">Price</span>
            <span className="text-center">Amount</span>
            <span />
          </div>

          {formData.materials.map((row) => {
            const matches = getMaterialMatches(row.name);

            return (
              <div
                key={row.id}
                className={`grid grid-cols-1 items-center gap-3 rounded-md border border-zinc-200 p-3 ${equipmentGrid} md:border-0 md:p-0`}
              >
                {/* Material search */}
                <div className="relative">
                  <Field label="Name" className="md:[&>span]:hidden">
                    <input
                      value={row.name}
                      onFocus={() => setOpenMaterialDropdown(row.id)}
                      onChange={(event) => {
                        updateMaterialRow(row.id, "name", event.target.value);

                        setOpenMaterialDropdown(row.id);
                      }}
                      placeholder="Material description or Unit"
                      className={compactInputClassName}
                    />
                  </Field>

                  {openMaterialDropdown === row.id &&
                    row.name &&
                    matches.length > 0 && (
                      <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border-2 border-black bg-white shadow-lg">
                        {matches.map((material) => (
                          <button
                            key={material.id}
                            type="button"
                            onClick={() => {
                              setFormData((current) => ({
                                ...current,
                                materials: current.materials.map(
                                  (materialRow) =>
                                    materialRow.id === row.id
                                      ? {
                                          ...materialRow,
                                          name: material.type,
                                          unit: material.unit,
                                        }
                                      : materialRow,
                                ),
                              }));

                              setOpenMaterialDropdown(null);
                            }}
                            className="w-full border-b px-3 py-2 text-left transition last:border-b-0 hover:bg-gray-100"
                          >
                            <div className="font-semibold">{material.type}</div>

                            <div className="text-sm text-gray-500">
                              Unit: {material.unit}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Unit */}
                <Field label="Unit" className="md:[&>span]:hidden">
                  <input
                    value={row.unit}
                    onChange={(event) =>
                      updateMaterialRow(row.id, "unit", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>

                {/* Quantity */}
                <Field label="Quantity" className="md:[&>span]:hidden">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.quantity}
                    onChange={(event) =>
                      updateMaterialRow(row.id, "quantity", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>

                {/* Price */}
                <Field label="Price" className="md:[&>span]:hidden">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.price}
                    onChange={(event) =>
                      updateMaterialRow(row.id, "price", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>

                {/* Amount */}
                <div className="text-center">
                  <CurrencyAmount
                    amount={calculateAmount(row.quantity, row.price)}
                  />
                </div>

                {/* Remove */}
                <RemoveButton onClick={() => removeRow("materials", row.id)} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Invoices"
          onAdd={addInvoiceRow}
          disabled={formData.invoices.length >= MAX_INVOICE_ROWS}
        />

        <div className="space-y-3">
          <div
            className={`hidden gap-3 font-bold underline md:grid ${invoiceGrid}`}
          >
            <span className="text-left pl-1">Name</span>
            <span className="text-center">Cost</span>
            <span className="text-center">Mark Up %</span>
            <span className="text-center">Amount</span>
          </div>

          {formData.invoices.map((row) => {
            const baseAmount = Number(row.cost) || 0;

            const markup = Number(row.markup) || 0;

            const total = baseAmount + baseAmount * (markup / 100);

            return (
              <div
                key={row.id}
                className={`grid grid-cols-1 items-center gap-3 rounded-md border border-zinc-200 p-3 md:border-0 md:p-0 ${invoiceGrid}`}
              >
                <Field label="Name" className="md:[&>span]:hidden">
                  <input
                    value={row.name}
                    onChange={(event) =>
                      updateInvoiceRow(row.id, "name", event.target.value)
                    }

                    className={compactInputClassName}
                  />
                </Field>

                <Field label="Cost" className="md:[&>span]:hidden">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={row.cost}
                    onChange={(event) => {
                      let value = event.target.value;

                      // Remove everything except digits and one decimal point
                      value = value.replace(/[^\d.]/g, "");

                      // Allow only one decimal point
                      const parts = value.split(".");
                      if (parts.length > 2) {
                        value = `${parts[0]}.${parts.slice(1).join("")}`;
                      }

                      // Limit to 2 decimal places
                      if (parts[1]) {
                        value = `${parts[0]}.${parts[1].slice(0, 2)}`;
                      }

                      updateInvoiceRow(row.id, "cost", value);
                    }}
                    className={compactInputClassName}
                  />
                </Field>

                <Field label="Markup %" className="md:[&>span]:hidden">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.markup}
                    onChange={(event) =>
                      updateInvoiceRow(row.id, "markup", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>
                <div className="text-center">
                  <span className="whitespace-nowrap text-base font-semibold text-park-green">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div className=" ">
                  <label className="inline-flex cursor-pointer items-center rounded-md bg-orange-400 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
                    Attach Invoice
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(event) =>
                        uploadInvoiceAttachment(row.id, event.target.files?.[0])
                      }
                    />
                  </label>

                  {row.invoiceAttachment && (
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <span>{row.invoiceAttachment.fileName}</span>

                      <button
                        type="button"
                        onClick={() => removeInvoiceAttachment(row.id)}
                        className="font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <RemoveButton onClick={() => removeRow("invoices", row.id)} />
              </div>
            );
          })}
        </div>
      </section>
    </form>
  );
}
