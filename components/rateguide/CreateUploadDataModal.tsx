"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onClose: () => void;
  category: "Labour" | "Equipment" | "Materials" | "Archa Rates";
};

export default function CreateUploadDataModal({ onClose, category }: Props) {
  const router = useRouter();
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
    setStatus("Uploading...");

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

      setStatus(result.message);

      router.refresh();

      setTimeout(() => {
        onClose();
      }, 700);
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
        onClick={() => fileInputRef.current?.click()}
        className="mt-8 w-full rounded-md border-[3px] border-black px-4 py-4 text-xl"
      >
        {selectedFile?.name ?? "Choose File"}
      </button>

      {status && (
        <p className="mt-3 text-center text-sm text-park-gray">{status}</p>
      )}

      <button
        type="submit"
        disabled={!selectedFile || isUploading}
        className="mt-8 w-full rounded-md bg-park-green px-6 py-3 text-2xl text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
}
