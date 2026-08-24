"use client";
import { useRouter } from "next/navigation";
import PageTransition from "./PageTransition";
import { divisions } from "@/types/ewr.types";
import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function CreateJobModal({ onClose }: Props) {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 2019 },
    (_, i) => currentYear + 2 - i,
  );

  const [jobNumber, setJobNumber] = useState("");
  const [jobName, setJobName] = useState("");
  const [address, setAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [division, setDivision] = useState(divisions[0]?.code ?? "");
  const [year, setYear] = useState(currentYear);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [jobNumberError, setJobNumberError] = useState("");
  const [addressError, setAddressError] = useState("");

  function validateJobNumber(value: string) {
    const jobNumberPattern = /^\d{2}-\d{3}$/;

    if (!jobNumberPattern.test(value.trim())) {
      return "Job # must follow the format 26-012.";
    }

    return "";
  }

  function validateAddress(value: string) {
    const parts = value.split(",").map((part) => part.trim());

    if (parts.length !== 3) {
      return "Address must follow the format: Street, City, Province Postal Code.";
    }

    const [street, city, provincePostal] = parts;

    if (!street || !city || !provincePostal) {
      return "Address must follow the format: 1453 91 St SW, Edmonton, AB T6X 0C8.";
    }

    // Canadian province abbreviation + postal code
    const provincePostalPattern =
      /^(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\s+[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;

    if (!provincePostalPattern.test(provincePostal)) {
      return "Use a province abbreviation and postal code, e.g. AB T6X 0C8.";
    }

    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newJobNumberError = validateJobNumber(jobNumber);
    const newAddressError = validateAddress(address);

    setJobNumberError(newJobNumberError);
    setAddressError(newAddressError);

    if (newJobNumberError || newAddressError) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/jobs", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          jobNumber,
          jobName,
          recipient,
          division,
          year,
          address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create job.");
      }

      router.refresh();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create job.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageTransition>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <label className="mb-2 block text-2xl font-bold">Job #</label>

              <input
                value={jobNumber}
                onChange={(event) => {
                  const value = event.target.value;

                  setJobNumber(value);

                  if (jobNumberError) {
                    setJobNumberError(validateJobNumber(value));
                  }
                }}
                placeholder="26-012"
                className={`w-full rounded-md border-[3px] border-black px-3 py-2 text-xl ${
                  jobNumberError ? "border-red-500" : "border-black"
                }`}
              />
              {jobNumberError && (
                <p className="mt-1 text-sm text-red-600">{jobNumberError}</p>
              )}
            </div>

            <div className="col-span-3">
              <label className="mb-2 block text-2xl font-bold">Job Name</label>

              <input
                value={jobName}
                onChange={(event) => setJobName(event.target.value)}
                className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
              />
            </div>

            <div className="col-span-4">
              <label className="mb-2 block text-2xl font-bold">Address</label>
              <input
                value={address}
                placeholder="1453 91 St SW, Edmonton, AB T6X 0C8"
                onChange={(event) => {
                  const value = event.target.value;

                  setAddress(value);

                  if (addressError) {
                    setAddressError(validateAddress(value));
                  }
                }}
                className={`w-full rounded-md border-[3px] px-3 py-2 text-xl ${
                  addressError ? "border-red-500" : "border-black"
                }`}
              />{" "}
              {addressError && (
                <p className="mt-1 text-sm text-red-600">{addressError}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="mb-2 block text-2xl font-bold">Customer</label>

              <input
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
              />
            </div>
            <div>
              <label className="mb-2 block text-2xl font-bold">Division</label>

              <select
                value={division}
                onChange={(event) => setDivision(event.target.value)}
                className="w-full rounded-md border-[3px] border-black bg-white px-3 py-2 text-xl"
              >
                {divisions.map((division) => (
                  <option key={division.code} value={division.code}>
                    {division.code} - {division.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-2xl font-bold">Year</label>

              <select
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="w-full rounded-md border-[3px] border-black bg-white px-3 py-2 text-xl"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="mt-4 text-center text-red-600">{error}</p>}

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className=" w-full rounded-md bg-park-green px-20 py-3 text-2xl cursor-pointer hover:bg-park-green-dark text-white transition-all duration-300"
            >
              {isSubmitting ? "Creating..." : "Submit"}
            </button>
          </div>
        </form>
      </PageTransition>
    </>
  );
}
