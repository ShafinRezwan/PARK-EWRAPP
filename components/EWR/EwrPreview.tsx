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

function calculatemarkUp(cost: string, markup: string) {
  return (Number(cost) || 0) + (Number(markup) / 100 || 0);
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

  const materialTotal = formData.materials.reduce(
    (total, row) => total + calculateAmount(row.quantity, row.price),
    0,
  );

  const invoiceTotal = formData.invoices.reduce((total, row) => {
    const cost = Number(row.cost) || 0;
    const markup = Number(row.markup) || 0;

    return total + cost + cost * (markup / 100);
  }, 0);

  const materialsAndInvoicesTotal = materialTotal + invoiceTotal;

  const grandTotal = labourTotal + equipmentTotal + materialsAndInvoicesTotal;

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    console.log("Save EWR", formData);
  };

  const handleSend = () => {
    console.log("Send EWR", formData);
  };

  const handleCancel = () => {
    console.log("Cancel EWR");
  };

  return (
    <div className="mx-auto w-full max-w-430px">
      <div id="ewr-print-area">
        <article
          id="ewr-preview"
          className="mx-auto aspect-[8.5/11] w-full  overflow-auto border border-black bg-white text-black"
        >
          <div className="flex h-full flex-col px-[4.5%] py-[4%]">
            {/* Main document border */}
            <div className="flex min-h-0 flex-1 flex-col border border-black">
              {/* Header */}
              <header className="relative h-[20%] shrink-0 border-b border-black px-[1.2%] py-[1.5%]">
                <div className="grid grid-cols-[28%_44%_28%] items-start">
                  <div>
                    <Image
                      src="/images/ppl-logo.png"
                      alt="Park Paving Ltd."
                      width={160}
                      height={95}
                      className="h-auto w-[85%] object-contain"
                      priority
                    />
                  </div>

                  <div className="pt-[8%] text-center">
                    <h1 className="text-[14px] font-bold uppercase tracking-tight">
                      Extra Work Report # 9800
                    </h1>
                  </div>

                  <div />
                </div>

                <div className=" grid grid-cols-2 text-[8px]">
                  <p>
                    <span className="font-bold">To:</span> {formData.recipient}
                  </p>

                  <p className="text-right">
                    <span className="font-bold">Date:</span>{" "}
                    {formatDate(formData.date)}
                  </p>
                </div>

                <div className="absolute bottom-[5%]  left-[1.2%] text-[8px] leading-tight">
                  <p>
                    <span className="font-bold">Job #:</span>{" "}
                    {formData.jobNumber}
                  </p>

                  <p>
                    <span className="font-bold">Job Name:</span>{" "}
                    {formData.jobName}
                  </p>
                </div>
              </header>

              {/* Labour */}
              <ReportSection
                columns="grid-cols-[62%_10%_10%_18%]"
                headers={["Classification", "Hrs.", "Rate", "Amount"]}
                rows={formData.labour.map((row) => [
                  row.classification,
                  row.hours,
                  row.rate ? moneyFormatter.format(Number(row.rate)) : "",
                  moneyFormatter.format(calculateAmount(row.hours, row.rate)),
                ])}
                totalLabel="Total Labour"
                total={labourTotal}
              />

              {/* Equipment */}
              <ReportSection
                columns="grid-cols-[45%_17%_9%_10%_19%]"
                headers={[
                  "Equipment & Rented Trucks Name",
                  "Unit No.",
                  "Hrs.",
                  "Rate",
                  "Amount",
                ]}
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

              {/* Materials  */}
              <ReportSection
                columns="grid-cols-[45%_17%_10%_10%_18%]"
                headers={["Materials", "Unit", "Qty.", "Price", "Amount"]}
                rows={[
                  ...formData.materials.map((row) => [
                    row.name,
                    row.unit,
                    row.quantity,
                    row.price ? moneyFormatter.format(Number(row.price)) : "",
                    moneyFormatter.format(
                      calculateAmount(row.quantity, row.price),
                    ),
                  ]),
                ]}
                totalLabel="Total Materials"
                total={materialsAndInvoicesTotal}
              />

              {/* Invoices  */}
              <ReportSection
                columns="grid-cols-[62%_10%_10%_18%]"
                headers={["Invoices", "Cost", "Mark Up %", "Amount"]}
                rows={formData.invoices.map((row) => [
                  row.name,
                  row.cost ? moneyFormatter.format(Number(row.cost)) : "",
                  row.markup,
                  moneyFormatter.format(calculatemarkUp(row.cost, row.markup)),
                ])}
                totalLabel="Total Invoice"
                total={labourTotal}
              />

              {/* Total */}
              <div className="flex h-[5%] shrink-0 flex-col justify-center border-b border-black px-[2%] text-[8px] font-bold uppercase">
                <div className="mt-[1%] flex justify-end">
                  <span className="w-[36%] text-right">Total&nbsp;&nbsp;$</span>

                  <span className="w-[15%] text-right">
                    {moneyFormatter.format(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="h-[8%] shrink-0 overflow-hidden border-t border-black px-[1%] py-[0.7%] text-[7px]">
                <p className="font-bold underline">Description of work:</p>

                <p className="mt-[0.8%] whitespace-pre-wrap leading-snug">
                  {formData.description}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Controls do not print */}
      <div className="mt-5 h-9 overflow-hidden rounded-lg border border-black bg-white print:hidden">
        <div className="h-full w-[10%] rounded-l-md bg-green-600" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 print:hidden">
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
        className="mt-3 w-full rounded-md bg-amber-500 px-4 py-2.5 text-xl font-semibold text-white transition hover:bg-amber-600 print:hidden"
      >
        PRINT PDF
      </button>
    </div>
  );
}

type ReportSectionProps = {
  columns: string;
  headers: string[];
  rows: string[][];
  totalLabel: string;
  total: number;
  maxRows?: number;
};

function ReportSection({
  columns,
  headers,
  rows,
  totalLabel,
  total,
  maxRows = 8,
}: ReportSectionProps) {
  const visibleRows = rows.slice(0, maxRows);

  return (
    <section className="shrink-0 ]">
      {/* Header row */}
      <div className={`grid h-5 bg-zinc-300 text-[7px] font-bold ${columns}`}>
        {headers.map((header, index) => (
          <div
            key={`${header}-${index}`}
            className={`flex min-w-0 items-center px-2 ${
              index < headers.length - 1 ? "border-r border-black" : ""
            } ${index === 0 ? "justify-start" : "justify-center"}`}
          >
            <span className="truncate">{header}</span>
          </div>
        ))}
      </div>

      {/* Dynamic rows */}
      <div className="border-b border-black">
        {visibleRows.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid min-h-5 text-[7px] ${columns}`}>
            {headers.map((_, columnIndex) => (
              <div
                key={columnIndex}
                className={`flex min-w-0 items-center px-2 py-0.5  ${
                  columnIndex < headers.length - 1
                    ? "border-r border-black"
                    : ""
                } ${
                  columnIndex === 0
                    ? "justify-start text-left"
                    : "justify-center text-center"
                }`}
              >
                <span className="truncate ">{row[columnIndex] ?? ""}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Keep one blank row when the section is empty */}
        {visibleRows.length === 0 && (
          <div className={`grid h-5 text-[7px] ${columns}`}>
            {headers.map((_, columnIndex) => (
              <div
                key={columnIndex}
                className={
                  columnIndex < headers.length - 1
                    ? "border-r border-black"
                    : ""
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Total row */}
      <div className={`grid h-10  text-[8px] font-bold uppercase ${columns}`}>
        <div className="[grid-column:1/-2] flex items-center justify-end  px-2 ">
          {totalLabel}
        </div>

        <div className="[grid-column:-2/-1] flex items-center justify-end px-2 ">
          {moneyFormatter.format(total)}
        </div>
      </div>
    </section>
  );
}
