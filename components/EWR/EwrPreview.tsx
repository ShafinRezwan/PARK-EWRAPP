"use client";

import Image from "next/image";
import type { EWRFormData } from "../../types/ewr.types";
import { useState, useEffect } from "react";
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

  const invoiceSubtotal = formData.invoices.reduce((total, row) => {
    return total + (Number(row.cost) || 0);
  }, 0);

  const hasInvoices = formData.invoices.some(
    (invoice) => invoice.name.trim() !== "" || invoice.cost.trim() !== "",
  );

  const invoiceMarkupTotal = formData.invoiceMarkups.reduce((total, markup) => {
    const percentage = Number(markup.markup) || 0;

    return total + invoiceSubtotal * (percentage / 100);
  }, 0);

  const invoiceTotal = invoiceSubtotal + invoiceMarkupTotal;

  const grandTotal =
    labourTotal + equipmentTotal + materialTotal + invoiceTotal;

  const invoiceAttachments = formData.invoices
    .map((invoice) => invoice.invoiceAttachment)
    .filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        attachment !== null,
    );

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");
      setSaveMessage("");

      // -----------------------------------------
      // 1. Save EWR
      // -----------------------------------------

      const payload = {
        jobId: formData.jobId,
        jobNumber: formData.jobNumber,
        recipient: formData.recipient,
        address: formData.address,
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
          amount: invoice.amount,

          hasAttachment: !!invoice.invoiceAttachment,
        })),
        invoiceMarkups: formData.invoiceMarkups,
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

      const responseText = await response.text();

      console.log("EWR SAVE STATUS:", response.status);
      console.log("EWR SAVE RESPONSE:", responseText);

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          `EWR API returned a non-JSON response: ${responseText}`,
        );
      }

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save EWR.");
      }

      // -----------------------------------------
      // 2. Get saved report ID
      // -----------------------------------------

      const savedReportId = result.report?.id;

      if (!savedReportId) {
        throw new Error("EWR was saved but no report ID was returned.");
      }

      // -----------------------------------------
      // 3. Upload NEW invoice attachments
      // -----------------------------------------

      for (const invoice of formData.invoices) {
        const attachment = invoice.invoiceAttachment;

        // No new file selected
        if (!attachment?.file) {
          continue;
        }

        const attachmentFormData = new FormData();

        attachmentFormData.append("file", attachment.file);

        attachmentFormData.append("invoiceId", invoice.id);

        const uploadResponse = await fetch(
          `/api/ewr/${savedReportId}/attachments`,
          {
            method: "POST",
            body: attachmentFormData,
          },
        );

        const uploadText = await uploadResponse.text();

        console.log("ATTACHMENT UPLOAD STATUS:", uploadResponse.status);

        console.log("ATTACHMENT UPLOAD RESPONSE:", uploadText);

        let uploadResult;

        try {
          uploadResult = JSON.parse(uploadText);
        } catch {
          throw new Error(
            `Attachment API returned a non-JSON response: ${uploadText}`,
          );
        }

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.error ?? `Unable to upload ${attachment.fileName}.`,
          );
        }
      }

      // -----------------------------------------
      // 4. Success message
      // -----------------------------------------

      setSaveMessage(
        `JOB: ${formData.jobNumber} - EWR #${result.report.ewrNumber} saved as draft`,
      );

      setShowSaveMessage(true);

      setTimeout(() => {
        setShowSaveMessage(false);
      }, 5000);

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);

      // -----------------------------------------
      // 5. Navigate / refresh
      // -----------------------------------------

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

  const splitAddressAtFirstComma = (address: string) => {
    const commaIndex = address.indexOf(",");

    if (commaIndex === -1) {
      return [address];
    }

    return [address.slice(0, commaIndex), address.slice(commaIndex + 1)];
  };

  return (
    <div className="mx-auto w-full max-w-430px">
      {/* Scrollable preview only */}
      <div className="ewr-preview-scroll max-h-[70vh] overflow-y-auto rounded-lg bg-zinc-200 p-4">
        <div id="ewr-print-area">
          <article
            id="ewr-preview"
            className="ewr-print-document mx-auto aspect-8.5/11 w-full overflow-hidden border border-black bg-white text-black shadow-md"
          >
            <div className="flex h-full flex-col px-[4.5%] py-[4%]">
              {/* Main document border */}
              <div className="flex min-h-0 flex-1 flex-col border border-black">
                {/* Header */}
                <header className="relative h-[23%] shrink-0  px-[1.2%] py-[1.5%]">
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
                      <h1 className=" whitespace-nowrap text-[14px] font-bold uppercase tracking-tight">
                        Extra Work Report # {formData.jobNumber}{" "}
                        {formData.ewrNumber}
                      </h1>
                    </div>

                    <div />
                  </div>

                  <div className="grid grid-cols-2 text-[8px] leading-tight">
                    {/* Left side */}
                    <div>
                      <div>
                        <span className="font-bold">To:</span>{" "}
                        {formData.recipient}
                      </div>

                      {formData.address && (
                        <div className="mt-1 ml-5 mb-2">
                          {splitAddressAtFirstComma(formData.address).map(
                            (line, index) => (
                              <div key={index}>{line.trim()}</div>
                            ),
                          )}
                        </div>
                      )}

                      <div className="mt-1">
                        <div className="mb-1">
                          <span className="font-bold ">Job #:</span>{" "}
                          {formData.jobNumber}
                        </div>

                        <div>
                          <span className="font-bold">Job Name:</span>{" "}
                          {formData.jobName}
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="text-right">
                      <span className="font-bold">Date:</span>{" "}
                      {formatDate(formData.date)}
                    </div>
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
                    headerBorder
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
                    headerBorder
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
                    headerBorder
                    headers={["Materials", "Unit", "Qty.", "Price", "Amount"]}
                    rows={formData.materials.map((row) => {
                      const amount = calculateAmount(row.quantity, row.price);

                      return [
                        row.name,
                        row.unit,
                        row.quantity,
                        row.price
                          ? moneyFormatter.format(Number(row.price))
                          : "",
                        amount !== 0 ? moneyFormatter.format(amount) : "",
                      ];
                    })}
                    totalLabel="Total Materials"
                    total={materialTotal}
                  />

                  {/* Invoices */}
                  <ReportSection
                    columns="grid-cols-[62%_20%_18%]"
                    headerBorder
                    headers={["Invoices", "Cost", "Amount"]}
                    rows={[
                      // Invoices
                      ...formData.invoices.map((row) => {
                        const cost = Number(row.cost) || 0;

                        return [
                          row.name,
                          row.cost ? moneyFormatter.format(cost) : "",
                          cost !== 0 ? moneyFormatter.format(cost) : "",
                        ];
                      }),

                      // Subtotal + markups only when an invoice exists
                      ...(hasInvoices
                        ? [
                            [
                              "Invoice Subtotal",
                              "",
                              moneyFormatter.format(invoiceSubtotal),
                            ],

                            ...formData.invoiceMarkups.map((markup) => {
                              const percentage = Number(markup.markup) || 0;

                              const markupAmount =
                                invoiceSubtotal * (percentage / 100);

                              return [
                                `${markup.name} (${percentage}%)`,
                                "",
                                markupAmount !== 0
                                  ? moneyFormatter.format(markupAmount)
                                  : "",
                              ];
                            }),
                          ]
                        : []),
                    ]}
                    totalLabel="Total Invoices"
                    total={invoiceTotal}
                  />
                </div>

                {/* Grand Total */}
                <div className="flex h-[5%] shrink-0 flex-col justify-center border-t border-black px-[2%] text-[8px] font-bold uppercase">
                  <div className="flex justify-end">
                    <span className="w-[36%] text-right">
                      Total&nbsp;&nbsp;$
                    </span>

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

          {/* Invoice Attachment Pages */}
          {invoiceAttachments.map((attachment) => {
            const isImage = attachment.fileType.startsWith("image/");

            const isPdf = attachment.fileType === "application/pdf";

            if (isImage) {
              return (
                <article
                  key={attachment.id}
                  className="invoice-print-page mx-auto mt-4 aspect-8.5/11 w-full bg-white"
                >
                  <img
                    src={attachment.previewUrl}
                    alt={attachment.fileName}
                    className="h-full w-full object-contain "
                  />
                </article>
              );
            }

            if (isPdf) {
              return (
                <PdfAttachmentPages
                  key={attachment.id}
                  file={attachment.file}
                  previewUrl={attachment.previewUrl}
                />
              );
            }

            return null;
          })}
        </div>
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
          disabled={isSaving || !formData.jobNumber || !formData.ewrNumber}
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

function PdfAttachmentPages({
  file,
  previewUrl,
}: {
  file: File | null;
  previewUrl: string;
}) {
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;

    async function renderPdf() {
      try {
        // Only load PDF.js in the browser
        const pdfjsLib = await import("pdfjs-dist");

        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        let bytes: ArrayBuffer;

        if (file) {
          bytes = await file.arrayBuffer();
        } else {
          const response = await fetch(previewUrl);

          if (!response.ok) {
            throw new Error("Unable to load saved PDF attachment.");
          }

          bytes = await response.arrayBuffer();
        }

        const loadingTask = pdfjsLib.getDocument({
          data: bytes,
        });

        const pdf = await loadingTask.promise;

        const renderedPages: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);

          const viewport = page.getViewport({
            scale: 2,
          });

          const canvas = document.createElement("canvas");

          const context = canvas.getContext("2d");

          if (!context) {
            continue;
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvas,
            canvasContext: context,
            viewport,
          }).promise;

          renderedPages.push(canvas.toDataURL("image/png"));
        }

        if (!cancelled) {
          setPages(renderedPages);
        }
      } catch (error) {
        console.error("PDF ATTACHMENT RENDER ERROR:", error);
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <>
      {pages.map((page, index) => (
        <article key={index} className="invoice-print-page">
          <img
            src={page}
            alt={`Invoice page ${index + 1}`}
            className="h-full w-full object-contain"
          />
        </article>
      ))}
    </>
  );
}

type ReportSectionProps = {
  columns: string;
  headers: string[];
  rows: string[][];
  totalLabel: string;
  total: number;
  headerBorder: boolean;
};

function ReportSection({
  columns,
  headers,
  headerBorder = false,
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
        className={`grid h-5 shrink-0 bg-zinc-300 text-[7px] font-bold ${columns} ${
          headerBorder ? "border-y border-black" : ""
        }`}
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

      {/* Row area */}
      <div className="min-h-0 flex-1 overflow-hidden border-b border-black">
        <div className="flex h-full flex-col">
          {displayRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid h-5 shrink-0 text-[7px] ${columns}`}
            >
              {headers.map((_, columnIndex) => (
                <div
                  key={columnIndex}
                  className={`flex min-w-0 items-center overflow-hidden px-2 ${
                    columnIndex < headers.length - 1
                      ? "border-r border-black"
                      : ""
                  } ${
                    columnIndex === 0
                      ? "justify-start text-left"
                      : "justify-center text-center"
                  } ${
                    row[0] === "Invoice Subtotal" &&
                    columnIndex === headers.length - 1
                      ? "border-b-2 border-black"
                      : ""
                  }`}
                >
                  <span
                    className={`truncate ${
                      row[0] === "Invoice Subtotal" ? "font-bold" : ""
                    }`}
                  >
                    {row[columnIndex] ?? ""}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {/* Empty space keeps column borders running down */}
          <div className={`grid min-h-0 flex-1 ${columns}`}>
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
