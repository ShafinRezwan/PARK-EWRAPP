"use client";

import { type Dispatch, type SetStateAction, type ReactNode } from "react";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type {
  EWRFormData,
  LabourFormRow,
  EquipmentFormRow,
  MaterialFormRow,
  InvoiceFormRow,
} from "./ewr.types.ts";

type EWRFormProps = {
  formData: EWRFormData;
  setFormData: Dispatch<SetStateAction<EWRFormData>>;
};

type SectionHeaderProps = {
  title: string;
  onAdd: () => void;
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

function SectionHeader({ title, onAdd }: SectionHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between rounded-md bg-park-green">
      <h2 className="px-3 text-lg font-semibold text-white">{title}</h2>

      <button
        type="button"
        onClick={onAdd}
        className="h-full rounded-r-md bg-park-green px-6 text-base font-semibold text-white transition hover:bg-park-green-dark"
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

export default function EWRForm({ formData, setFormData }: EWRFormProps) {
  const updateMainField = (
    field: keyof Pick<
      EWRFormData,
      "recipient" | "jobNumber" | "date" | "jobName" | "description"
    >,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

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
    field: keyof Omit<InvoiceFormRow, "id">,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      invoices: current.invoices.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const removeRow = (
    section: "labour" | "equipment" | "materials" | "invoices",
    id: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [section]: current[section].filter((row) => row.id !== id),
    }));
  };

  const addLabourRow = () => {
    setFormData((current) => ({
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
    }));
  };

  const addEquipmentRow = () => {
    setFormData((current) => ({
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
    }));
  };

  const addMaterialRow = () => {
    setFormData((current) => ({
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
    }));
  };

  const addInvoiceRow = () => {
    setFormData((current) => ({
      ...current,
      invoices: [
        ...current.invoices,
        {
          id: createId(),
          name: "",
          markup: "10",
          amount: "",
        },
      ],
    }));
  };

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="mx-auto w-full max-w-4xl space-y-7"
    >
      <section className="space-y-3">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <Field label="To:" className="col-span-3">
            <input
              value={formData.recipient}
              onChange={(event) =>
                updateMainField("recipient", event.target.value)
              }
              className={inputClassName}
            />
          </Field>

          <Field label="Job #:">
            <input
              value={formData.jobNumber}
              onChange={(event) =>
                updateMainField("jobNumber", event.target.value)
              }
              className={inputClassName}
            />
          </Field>

          <Field label="Date:">
            <Popover>
              <PopoverTrigger>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full justify-between rounded-md border-2 border-black px-3 text-base "
                >
                  {formData.date
                    ? format(
                        new Date(`${formData.date}T00:00:00`),
                        "MMM dd, yyyy",
                      )
                    : "Pick a date"}

                  <CalendarIcon className="h-5 w-5 opacity-70" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={
                    formData.date
                      ? new Date(`${formData.date}T00:00:00`)
                      : undefined
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
        <SectionHeader title="Labour" onAdd={addLabourRow} />

        <div className="space-y-3">
          <div className="hidden grid-cols-[minmax(150px,2fr)_90px_90px_110px_40px] gap-4 px-3 text-center font-semibold underline md:grid">
            <span>Classification</span>
            <span>Hours</span>
            <span>Rate</span>
            <span>Amount</span>
            <span />
          </div>

          {formData.labour.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 items-end gap-3 rounded-md border border-zinc-200 p-3 md:grid-cols-[minmax(150px,2fr)_90px_90px_110px_40px] md:border-0 md:p-0"
            >
              <Field label="Classification" className="md:[&>span]:hidden">
                <input
                  value={row.classification}
                  onChange={(event) =>
                    updateLabourRow(
                      row.id,
                      "classification",
                      event.target.value,
                    )
                  }
                  className={compactInputClassName}
                />
              </Field>

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

              <div className="flex h-9 items-center md:justify-center">
                <CurrencyAmount amount={calculateAmount(row.hours, row.rate)} />
              </div>

              <RemoveButton onClick={() => removeRow("labour", row.id)} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Equipment & Rented Trucks"
          onAdd={addEquipmentRow}
        />

        <div className="space-y-3">
          <div className="hidden grid-cols-[minmax(130px,1.8fr)_90px_80px_80px_110px_40px] gap-3 px-2 text-center font-semibold underline md:grid">
            <span>Name</span>
            <span>Unit No.</span>
            <span>Hours</span>
            <span>Rate</span>
            <span>Amount</span>
            <span />
          </div>

          {formData.equipment.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 items-end gap-3 rounded-md border border-zinc-200 p-3 md:grid-cols-[minmax(130px,1.8fr)_90px_80px_80px_110px_40px] md:border-0 md:p-0"
            >
              <Field label="Name" className="md:[&>span]:hidden">
                <input
                  value={row.name}
                  onChange={(event) =>
                    updateEquipmentRow(row.id, "name", event.target.value)
                  }
                  className={compactInputClassName}
                />
              </Field>

              <Field label="Unit No." className="md:[&>span]:hidden">
                <input
                  value={row.unitNumber}
                  onChange={(event) =>
                    updateEquipmentRow(row.id, "unitNumber", event.target.value)
                  }
                  className={compactInputClassName}
                />
              </Field>

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

              <div className="flex h-9 items-center md:justify-center">
                <CurrencyAmount amount={calculateAmount(row.hours, row.rate)} />
              </div>

              <RemoveButton onClick={() => removeRow("equipment", row.id)} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Materials" onAdd={addMaterialRow} />

        <div className="space-y-3">
          <div className="hidden grid-cols-[minmax(130px,1.8fr)_80px_80px_80px_110px_40px] gap-3 px-2 text-center font-semibold underline md:grid">
            <span>Name</span>
            <span>Unit</span>
            <span>Quantity</span>
            <span>Price</span>
            <span>Amount</span>
            <span />
          </div>

          {formData.materials.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 items-end gap-3 rounded-md border border-zinc-200 p-3 md:grid-cols-[minmax(130px,1.8fr)_80px_80px_80px_110px_40px] md:border-0 md:p-0"
            >
              <Field label="Name" className="md:[&>span]:hidden">
                <input
                  value={row.name}
                  onChange={(event) =>
                    updateMaterialRow(row.id, "name", event.target.value)
                  }
                  className={compactInputClassName}
                />
              </Field>

              <Field label="Unit" className="md:[&>span]:hidden">
                <input
                  value={row.unit}
                  onChange={(event) =>
                    updateMaterialRow(row.id, "unit", event.target.value)
                  }
                  className={compactInputClassName}
                />
              </Field>

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

              <div className="flex h-9 items-center md:justify-center">
                <CurrencyAmount
                  amount={calculateAmount(row.quantity, row.price)}
                />
              </div>

              <RemoveButton onClick={() => removeRow("materials", row.id)} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Invoices" onAdd={addInvoiceRow} />

        <div className="space-y-3">
          <div className="hidden grid-cols-[minmax(180px,2fr)_110px_130px_40px] gap-4 px-3 text-center font-semibold underline md:grid">
            <span>Name</span>
            <span>Markup %</span>
            <span>Amount</span>
            <span />
          </div>

          {formData.invoices.map((row) => {
            const baseAmount = Number(row.amount) || 0;

            const markup = Number(row.markup) || 0;

            const total = baseAmount + baseAmount * (markup / 100);

            return (
              <div
                key={row.id}
                className="grid grid-cols-1 items-end gap-3 rounded-md border border-zinc-200 p-3 md:grid-cols-[minmax(180px,2fr)_110px_130px_40px] md:border-0 md:p-0"
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

                <Field label="Markup %" className="md:[&>span]:hidden">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.markup}
                    onChange={(event) =>
                      updateInvoiceRow(row.id, "markup", event.target.value)
                    }
                    className={compactInputClassName}
                  />
                </Field>

                <Field label="Amount" className="md:[&>span]:hidden">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount}
                      onChange={(event) =>
                        updateInvoiceRow(row.id, "amount", event.target.value)
                      }
                      className={compactInputClassName}
                    />
                  </div>

                  <p className="mt-1 text-sm font-semibold text-park-green">
                    Total: ${total.toFixed(2)}
                  </p>
                </Field>

                <RemoveButton onClick={() => removeRow("invoices", row.id)} />
              </div>
            );
          })}
        </div>
      </section>
    </form>
  );
}
