"use client";

import Image from "next/image";
import type { EWRFormData } from "../../types/ewr.types";
import { useState } from "react";
import { useRouter } from "next/navigation";

type EWRPreviewProps = {
  formData: EWRFormData;
  reportId: string | null;
  ewrNumber: string;
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function calculateAmount(quantity: string, rate: string) {
  return (Number(quantity) || 0) * (Number(rate) || 0);
}

function calculateMarkup(cost: string, markup: string) {
  const parsedCost = Number(cost) || 0;
  const parsedMarkup = Number(markup) || 0;

  return parsedCost + parsedCost * (parsedMarkup / 100);
}

function formatDate(date: string) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function EWRPreview({
  formData,
  reportId,
  ewrNumber,
}: EWRPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const router = useRouter();

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
    return total + calculateMarkup(row.cost, row.markup);
  }, 0);

  const grandTotal =
    labourTotal + equipmentTotal + materialTotal + invoiceTotal;

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");
      setSaveMessage("");

      const payload = {
        jobId: formData.jobId,
        jobNumber: formData.jobNumber,
        recipient: formData.recipient,
        date: formData.date,
        description: formData.description,
        ewrNumber: formData.ewrNumber,

        labour: formData.labour,
        equipment: formData.equipment,
        materials: formData.materials,

        invoices: formData.invoices.map((invoice) => ({
          id: invoice.id,
          name: invoice.name,
          cost: invoice.cost,
          markup: invoice.markup,
          amount: invoice.amount,
        })),
      };

      const response = await fetch(
        reportId ? `/api/ewr/${reportId}` : "/api/ewr",
        {
          method: reportId ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save EWR.");
      }

      // Show success message
      setSaveMessage(`EWR #${result.report.ewrNumber} saved as draft`);

      setShowSaveMessage(true);

      setTimeout(() => {
        setShowSaveMessage(false);
      }, 2500);

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);

      // New report
      if (!reportId && result.report?.id) {
        router.replace(`/create-ewr?id=${result.report.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Save EWR error:", error);

      setSaveError(
        error instanceof Error ? error.message : "Unable to save EWR.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = () => {
    console.log("Send EWR", formData);
  };

  const handleCancel = () => {
    router.push("/work-reports");
  };

  return (
    <div className="mx-auto w-full max-w-430px">
      <div id="ewr-print-area">
        <article
          id="ewr-preview"
          className="mx-auto aspect-8.5/11 w-full overflow-hidden border border-black bg-white text-black"
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
                      Extra Work Report # {formData.ewrNumber}
                    </h1>
                  </div>

                  <div />
                </div>

                <div className="grid grid-cols-2 text-[8px]">
                  <p>
                    <span className="font-bold">To:</span> {formData.recipient}
                  </p>

                  <p className="text-right">
                    <span className="font-bold">Date:</span>{" "}
                    {formatDate(formData.date)}
                  </p>
                </div>

                <div className="absolute bottom-[5%] left-[1.2%] text-[8px] leading-tight">
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

              {/* 
                Dynamic section area.
                This is the portion that expands/shrinks,
                while the whole PDF stays one page.
              */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {/* Labour */}
                <ReportSection
                  columns="grid-cols-[62%_10%_10%_18%]"
                  headers={["Classification", "Hrs.", "Rate", "Amount"]}
                  rows={formData.labour.map((row) => {
                    const amount = calculateAmount(row.hours, row.rate);

                    return [
                      row.classification,
                      row.hours,
                      row.rate ? moneyFormatter.format(Number(row.rate)) : "",
                      amount !== 0 ? moneyFormatter.format(amount) : "",
                    ];
                  })}
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
                  rows={formData.equipment.map((row) => {
                    const amount = calculateAmount(row.hours, row.rate);

                    return [
                      row.name,
                      row.unitNumber,
                      row.hours,
                      row.rate ? moneyFormatter.format(Number(row.rate)) : "",
                      amount !== 0 ? moneyFormatter.format(amount) : "",
                    ];
                  })}
                  totalLabel="Total Equipment"
                  total={equipmentTotal}
                />

                {/* Materials */}
                <ReportSection
                  columns="grid-cols-[45%_17%_10%_10%_18%]"
                  headers={["Materials", "Unit", "Qty.", "Price", "Amount"]}
                  rows={formData.materials.map((row) => {
                    const amount = calculateAmount(row.quantity, row.price);

                    return [
                      row.name,
                      row.unit,
                      row.quantity,
                      row.price ? moneyFormatter.format(Number(row.price)) : "",
                      amount !== 0 ? moneyFormatter.format(amount) : "",
                    ];
                  })}
                  totalLabel="Total Materials"
                  total={materialTotal}
                />

                {/* Invoices */}
                <ReportSection
                  columns="grid-cols-[62%_10%_10%_18%]"
                  headers={["Invoices", "Cost", "Mark Up %", "Amount"]}
                  rows={formData.invoices.map((row) => {
                    const amount = calculateMarkup(row.cost, row.markup);

                    return [
                      row.name,
                      row.cost ? moneyFormatter.format(Number(row.cost)) : "",
                      row.markup,
                      amount !== 0 ? moneyFormatter.format(amount) : "",
                    ];
                  })}
                  totalLabel="Total Invoice"
                  total={invoiceTotal}
                />
              </div>

              {/* Grand Total */}
              <div className="flex h-[5%] shrink-0 flex-col justify-center border-t border-black px-[2%] text-[8px] font-bold uppercase">
                <div className="flex justify-end">
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
          disabled={isSaving || !!ewrNumber}
          className="rounded-md bg-sky-600 px-3 py-2.5 text-lg font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "SAVING..." : "SAVE"}
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
      {saveMessage && (
        <div
          className={`
      fixed left-1/2 top-2 z-[9999]
      -translate-x-1/2
      rounded-lg
      bg-park-green
      px-6 py-3
      text-lg font-semibold text-white
      shadow-xl

      transition-all
      duration-500
      ease-in-out

      ${
        showSaveMessage
          ? "translate-y-0 opacity-100"
          : "-translate-y-6 opacity-0"
      }
    `}
        >
          ✓ {saveMessage}
        </div>
      )}
    </div>
  );
}

type ReportSectionProps = {
  columns: string;
  headers: string[];
  rows: string[][];
  totalLabel: string;
  total: number;
};

function ReportSection({
  columns,
  headers,
  rows,
  totalLabel,
  total,
}: ReportSectionProps) {
  /*
    At least one row is always rendered so an empty section
    still receives some space.
  */
  const displayRows = rows.length > 0 ? rows : [Array(headers.length).fill("")];

  /*
    More rows = this section receives more of the available
    vertical space.

    +1 prevents sections with few rows from becoming
    excessively tiny because they still need room for
    their header and total.
  */
  const sectionWeight = Math.max(displayRows.length + 1, 2);

  return (
    <section
      className="flex min-h-0 flex-col overflow-hidden"
      style={{
        flexGrow: sectionWeight,
        flexBasis: 0,
      }}
    >
      {/* Column headers */}
      <div
        className={`grid h-5 shrink-0 bg-zinc-300 text-[7px] font-bold ${columns}`}
      >
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

      {/* Dynamic row area */}
      <div className="min-h-0 flex-1 overflow-hidden border-b border-black">
        <div
          className="grid h-full min-h-0"
          style={{
            gridTemplateRows: `repeat(${displayRows.length}, minmax(0, 1fr))`,
          }}
        >
          {displayRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid min-h-0 text-[7px] ${columns}`}
            >
              {headers.map((_, columnIndex) => (
                <div
                  key={columnIndex}
                  className={`flex min-h-0 min-w-0 items-center overflow-hidden px-2 ${
                    columnIndex < headers.length - 1
                      ? "border-r border-black"
                      : ""
                  } ${
                    columnIndex === 0
                      ? "justify-start text-left"
                      : "justify-center text-center"
                  }`}
                >
                  <span className="truncate">{row[columnIndex] ?? ""}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Section total */}
      <div
        className={`grid h-8 shrink-0 text-[8px] font-bold uppercase ${columns}`}
      >
        <div className="col-[1/-2] flex items-center justify-end px-2">
          {totalLabel}
        </div>

        <div className="col-[-2/-1] flex items-center justify-end px-2">
          {moneyFormatter.format(total)}
        </div>
      </div>
    </section>
  );
}
