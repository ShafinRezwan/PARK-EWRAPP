"use client";

import PageTransition from "./PageTransition";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { Job } from "@/lib/jobs";
import { divisions } from "@/types/ewr.types";

type Props = {
  job: Job;
  onClose: () => void;
};

export default function EditJobModal({ job, onClose }: Props) {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 2019 },
    (_, i) => currentYear + 2 - i,
  );

  const [jobNumber, setJobNumber] = useState(job.jobNumber);

  const [jobName, setJobName] = useState(job.jobName);

  const [address, setAddress] = useState(job.address ?? "");

  const [recipient, setRecipient] = useState(job.recipient ?? "");

  const [division, setDivision] = useState(job.division);

  const [year, setYear] = useState(job.year);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [jobNumberError, setJobNumberError] = useState("");

  const [addressError, setAddressError] = useState("");

  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // -----------------------------------------
  // Validation
  // -----------------------------------------

  function validateJobNumber(value: string) {
    const jobNumberPattern = /^\d{2}-\d{3}$/;

    if (!jobNumberPattern.test(value.trim())) {
      return "Job # must follow the format 26-012.";
    }

    return "";
  }

  async function handleDeleteJob(job: Job) {
    const confirmed = window.confirm(
      `Delete Job ${job.jobNumber} - ${job.jobName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete job.");
      }

      router.refresh();
      onClose();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete job.",
      );
    } finally {
      setIsDeleting(false);
    }
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

    const provincePostalPattern =
      /^(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\s+[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;

    if (!provincePostalPattern.test(provincePostal)) {
      return "Use a province abbreviation and postal code, e.g. AB T6X 0C8.";
    }

    return "";
  }

  // -----------------------------------------
  // Submit
  // -----------------------------------------

  async function handleSubmit(event: FormEvent) {
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

      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobNumber,
          jobName,
          address,
          recipient,
          division,
          year,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update job.");
      }

      router.refresh();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update job.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <form onSubmit={handleSubmit}>
        <h1 className="mb-8 text-center text-3xl font-bold">EDIT JOB</h1>

        <div className="grid grid-cols-6 gap-4">
          {/* Job Number */}

          <div className="col-span-2">
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
              className={`w-full rounded-md border-[3px] px-3 py-2 text-xl ${
                jobNumberError ? "border-red-500" : "border-black"
              }`}
            />

            {jobNumberError && (
              <p className="mt-1 text-sm text-red-600">{jobNumberError}</p>
            )}
          </div>

          {/* Job Name */}

          <div className="col-span-4">
            <label className="mb-2 block text-2xl font-bold">Job Name</label>

            <input
              value={jobName}
              onChange={(event) => setJobName(event.target.value)}
              className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
            />
          </div>

          {/* Address */}

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
            />

            {addressError && (
              <p className="mt-1 text-sm text-red-600">{addressError}</p>
            )}
          </div>

          {/* Customer */}

          <div className="col-span-2">
            <label className="mb-2 block text-2xl font-bold">Customer</label>

            <input
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              className="w-full rounded-md border-[3px] border-black px-3 py-2 text-xl"
            />
          </div>

          {/* Division */}

          <div className="col-span-3">
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

          {/* Year */}

          <div className="col-span-3">
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

        {error && (
          <p className="mt-4 text-center font-semibold text-red-600">{error}</p>
        )}

        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => handleDeleteJob(job)}
            className="w-full cursor-pointer rounded-md bg-red-600 px-6 py-3 text-xl font-semibold text-white transition hover:bg-red-700   disabled:opacity-50"
          >
            Delete
          </button>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !jobNumber.trim() ||
              !jobName.trim() ||
              !address.trim()
            }
            className="w-full cursor-pointer rounded-md bg-park-green px-6 py-3 text-xl font-semibold text-white transition hover:bg-park-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </PageTransition>
  );
}
