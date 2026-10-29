"use client";

import { FormEvent, useRef, useState } from "react";

type Props = {
  onClose: () => void;
  onUploadSuccess: (category: string, count: number) => void;
  category: "Labour" | "Equipment" | "Materials" | "Archa Rates";
};

export default function CreateUploadDataModal({
  onClose,
  category,
  onUploadSuccess,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setStatus("Choose a file first.");
      return;
    }

    setIsUploading(true);
    setStatus("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("category", category);

      const response = await fetch("/api/rates/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Upload failed.");
      }

      const uploadedCount = Number(result.uploadedCount);

      // Close the upload modal and show the success popup.
      onUploadSuccess(
        category,
        Number.isFinite(uploadedCount) ? uploadedCount : 0,
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "The file could not be uploaded.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-center text-3xl font-bold">
        Upload/Update Data for:{" "}
        <span className="text-park-green">{category}</span>
      </h1>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            setSelectedFile(file);
            setStatus("");
          }
        }}
      />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="mt-8 w-full rounded-md border-[4px] border-black px-4 py-4 text-xl disabled:opacity-50 cursor-pointer"
      >
        {selectedFile?.name ?? "Choose File"}
      </button>

      {status && (
        <p
          role="alert"
          className="mt-3 text-center text-lg font-bold text-red-600"
        >
          {status}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="flex-1 rounded-md bg-red-600 px-6 py-3 text-xl text-white font-semibold disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="flex-1 rounded-md bg-park-green px-6 py-3 text-xl text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isUploading ? "Uploading..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
