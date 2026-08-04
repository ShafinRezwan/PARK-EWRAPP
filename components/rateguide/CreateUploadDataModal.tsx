"use client";
import PageTransition from "../PageTransition";

import { FormEvent, useState, useRef } from "react";

type Props = {
  onClose: () => void;
  category: "Labour" | "Equipment" | "Materials";
};

export default function CreateUploadDataModal({ onClose, category }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("");

  function chooseFile() {
    fileInputRef.current?.click();
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("Uploading...");

    setFile(file);
  };

  async function handleSubmit() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Upload here

    onClose();
  }

  return (
    <PageTransition>
      <form onSubmit={handleSubmit}>
        <h1 className="text-3xl text-park-green font-bold  text-left">
          Upload/Update Data for: <span className="text-black">{category}</span>
        </h1>
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />{" "}
          <button
            type="button"
            onClick={chooseFile}
            className="flex h-16 w-full cursor-pointer items-center justify-center rounded-md border-[3px] border-black text-2xl font-semibold hover:bg-gray-100"
          >
            {file ? file.name : "Choose File"}
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file}
            className="w-full cursor-pointer rounded-md bg-park-green px-20 py-3 text-2xl text-white transition-all duration-300 hover:bg-park-green-dark"
          >
            Submit
          </button>
        </div>
      </form>
    </PageTransition>
  );
}
