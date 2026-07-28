"use client";
import Image from "next/image";

import type { EWRFormData } from "./ewr.types";

type EWRPreviewProps = {
  formData: EWRFormData;
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function calculateAmount(quantity: string, rate: string) {
  return (Number(quantity) || 0) * (Number(rate) || 0);
}

function formatDate(date: string) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function EWRPreview({ formData }: EWRPreviewProps) {
  const labourTotal = formData.labour.reduce(
    (total, row) => total + calculateAmount(row.hours, row.rate),
    0,
  );

  const equipmentTotal = formData.equipment.reduce(
    (total, row) => total + calculateAmount(row.hours, row.rate),
    0,
  );

  const materialsTotal = formData.materials.reduce(
    (total, row) => total + calculateAmount(row.quantity, row.price),
    0,
  );

  const invoicesTotal = formData.invoices.reduce((total, row) => {
    const amount = Number(row.amount) || 0;
    const markup = Number(row.markup) || 0;

    return total + amount + amount * (markup / 100);
  }, 0);

  const grandTotal =
    labourTotal + equipmentTotal + materialsTotal + invoicesTotal;

  const handleSave = () => {
    console.log("Saving EWR", formData);
  };

  const handleSend = () => {
    console.log("Sending EWR", formData);
  };

  const handleCancel = () => {
    console.log("Cancel EWR");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto w-full max-w-[390px]">
      <article
        id="ewr-preview"
        className="aspect-[8.5/11] overflow-hidden rounded-sm border-[3px] border-black bg-white text-[7px] text-black shadow-sm"
      >
        <header className="min-h-[158px] border-b-2 border-black p-3">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <Image
                src="/images/ppl-logo.png"
                alt="Park Paving"
                width={80}
                height={90}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <p>
              <span className="font-bold">To:</span> {formData.recipient}
            </p>

            <p className="text-right">
              <span className="font-bold">Date:</span>{" "}
              {formatDate(formData.date)}
            </p>

            <div className="col-span-2">
              <p>
                <span className="font-bold">Job #:</span> {formData.jobNumber}
              </p>

              <p>
                <span className="font-bold">Job Name:</span> {formData.jobName}
              </p>
            </div>
          </div>
        </header>

        <PreviewSection
          title="Labour"
          headers={["Classification", "Hrs.", "Rate", "Amount"]}
          columns="grid-cols-[1fr_42px_48px_74px]"
          rows={formData.labour.map((row) => [
            row.classification,
            row.hours,
            row.rate ? moneyFormatter.format(Number(row.rate)) : "",
            moneyFormatter.format(calculateAmount(row.hours, row.rate)),
          ])}
          totalLabel="Total Labour"
          total={labourTotal}
        />

        <PreviewSection
          title="Equipment and Rented Trucks"
          headers={["Name", "Unit No.", "Hrs.", "Rate", "Amount"]}
          columns="grid-cols-[1fr_52px_38px_46px_70px]"
          rows={formData.equipment.map((row) => [
            row.name,
            row.unitNumber,
            row.hours,
            row.rate ? moneyFormatter.format(Number(row.rate)) : "",
            moneyFormatter.format(calculateAmount(row.hours, row.rate)),
          ])}
          totalLabel="Total Equipment"
          total={equipmentTotal}
        />

        <PreviewSection
          title="Materials / Invoices"
          headers={["Name", "Unit", "Quantity", "Price", "Amount"]}
          columns="grid-cols-[1fr_46px_52px_48px_70px]"
          rows={[
            ...formData.materials.map((row) => [
              row.name,
              row.unit,
              row.quantity,
              row.price ? moneyFormatter.format(Number(row.price)) : "",
              moneyFormatter.format(calculateAmount(row.quantity, row.price)),
            ]),

            ...formData.invoices.map((row) => {
              const amount = Number(row.amount) || 0;

              const markup = Number(row.markup) || 0;

              const markedUpAmount = amount + amount * (markup / 100);

              return [
                row.name,
                "Invoice",
                `${markup}%`,
                moneyFormatter.format(amount),
                moneyFormatter.format(markedUpAmount),
              ];
            }),
          ]}
          totalLabel="Total Materials / Invoices"
          total={materialsTotal + invoicesTotal}
        />

        <div className="flex h-7 items-center justify-end border-b-2 border-black px-2 font-bold">
          Total: {moneyFormatter.format(grandTotal)}
        </div>

        <div className="min-h-24 p-2">
          <p className="font-bold">Description of work:</p>

          <p className="mt-1 whitespace-pre-wrap">{formData.description}</p>
        </div>
      </article>

      <div className="mt-5 h-9 overflow-hidden rounded-lg border border-black bg-white">
        <div className="h-full w-[10%] rounded-l-md bg-green-600" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md bg-red-600 px-3 py-2.5 text-lg font-semibold text-white transition hover:bg-red-700"
        >
          CANCEL
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-sky-600 px-3 py-2.5 text-lg font-semibold text-white transition hover:bg-sky-700"
        >
          SAVE
        </button>

        <button
          type="button"
          onClick={handleSend}
          className="rounded-md bg-green-600 px-3 py-2.5 text-lg font-semibold text-white transition hover:bg-green-700"
        >
          SEND
        </button>
      </div>

      <button
        type="button"
        onClick={handlePrint}
        className="mt-3 w-full rounded-md bg-amber-500 px-4 py-2.5 text-xl font-semibold text-white transition hover:bg-amber-600"
      >
        PRINT PDF
      </button>
    </div>
  );
}

type PreviewSectionProps = {
  title: string;
  headers: string[];
  columns: string;
  rows: string[][];
  totalLabel: string;
  total: number;
};

function PreviewSection({
  title,
  headers,
  columns,
  rows,
  totalLabel,
  total,
}: PreviewSectionProps) {
  return (
    <section className="border-b-2 border-black">
      <div
        className={`grid ${columns} border-b border-black bg-zinc-200 font-bold`}
      >
        {headers.map((header, index) => (
          <div
            key={header}
            className={`flex min-h-5 items-center px-1 ${
              index !== headers.length - 1 ? "border-r border-black" : ""
            }`}
          >
            {index === 0 ? title : header}
          </div>
        ))}
      </div>

      <div className="min-h-[104px]">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid ${columns} min-h-6`}>
            {row.map((value, cellIndex) => (
              <div
                key={cellIndex}
                className={`overflow-hidden px-1 py-1 ${
                  cellIndex !== row.length - 1 ? "border-r border-black" : ""
                }`}
              >
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex h-6 items-center justify-end border-t border-black px-2 font-bold">
        {totalLabel}: {moneyFormatter.format(total)}
      </div>
    </section>
  );
}
