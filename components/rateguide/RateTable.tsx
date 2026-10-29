"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@base-ui/react";

import Modal from "../Modal";
import CreateUploadDataModal from "@/components/rateguide/CreateUploadDataModal";
import LabourTable from "./LabourTable";
import MaterialsTable from "./MaterialsTable";
import EquipmentTable from "./EquipmentTable";
import { LabourRate, EquipmentRate, MaterialRate } from "@/lib/rates";

type Props = {
  labourRates: LabourRate[];
  equipmentRates: EquipmentRate[];
  materialRates: MaterialRate[];
};

export default function RateTable({
  labourRates,
  equipmentRates,
  materialRates,
}: Props) {
  const tabs = ["Labour", "Equipment", "Materials", "Archa Rates"] as const;

  const [searchQuery, setSearchQuery] = useState("");

  const [uploadModal, setShowUploadModal] = useState(false);

  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("Labour");

  // SUCCESS POPUP LOGIC — ADD HERE
  const router = useRouter();

  const [uploadSuccess, setUploadSuccess] = useState<{
    category: string;
    count: number;
  } | null>(null);

  const handleUploadSuccess = (category: string, count: number) => {
    setShowUploadModal(false);
    setUploadSuccess({ category, count });
    router.refresh();
  };

  const search = searchQuery.toLowerCase().trim();

  const filteredLabourRates = labourRates.filter((rate) => {
    if (!search) return true;

    return (
      String(rate.employeeNumber).includes(search) ||
      rate.baseWorkClass.toLowerCase().includes(search) ||
      rate.baseClassName.toLowerCase().includes(search) ||
      String(rate.rate).includes(search) ||
      String(rate.saturdayRate).includes(search) ||
      String(rate.sundayRate).includes(search)
    );
  });

  const filteredEquipmentRates = equipmentRates.filter((rate) => {
    if (!search) return true;

    return (
      rate.equipmentNumber.toLowerCase().includes(search) ||
      rate.makeModelYear.toLowerCase().includes(search) ||
      rate.description.toLowerCase().includes(search) ||
      String(rate.rate).includes(search) ||
      String(rate.horsePower ?? "").includes(search)
    );
  });

  const filteredMaterialRates = materialRates.filter((rate) => {
    if (!search) return true;

    return (
      rate.type.toLowerCase().includes(search) ||
      rate.unit.toLowerCase().includes(search)
    );
  });

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border-[3px] border-black">
      <div className="flex h-24 w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setSelectedTab(tab);
              setSearchQuery("");
            }}
            className={`
              cursor-pointer
              text-3xl
              font-semibold
              text-white
              transition-all
              duration-500
              ease-in-out
              px-2
              ${selectedTab === tab ? "flex-1" : "w-45"}
              ${
                tab === "Labour"
                  ? "bg-[#2CAB5D]"
                  : tab === "Equipment"
                    ? "bg-[#C90202]"
                    : tab === "Materials"
                      ? "bg-[#2C4EAB]"
                      : "bg-[#cf6112]"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex justify-between px-3 py-2">
        <input
          id="dashboard-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search"
          className="max-w-sm rounded-md border-[3px] border-black px-2 py-2 text-xl text-park-gray outline-none transition focus:border-park-green"
        />

        <Button
          type="button"
          className="cursor-pointer rounded-md bg-park-green px-10 py-3 text-xl text-white transition-all duration-200 hover:bg-park-green-dark"
          onClick={() => setShowUploadModal(true)}
        >
          Upload Data
        </Button>
      </div>

      <Modal isOpen={uploadModal} onClose={() => setShowUploadModal(false)}>
        <CreateUploadDataModal
          category={selectedTab}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </Modal>

      <Modal
        isOpen={uploadSuccess !== null}
        onClose={() => setUploadSuccess(null)}
      >
        <div className="flex min-w-80 flex-col items-center gap-2 p-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-9 w-9"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Upload Successful!
          </h2>

          <p className="text-gray-900 text-xl font-semibold">
            Your {uploadSuccess?.category} rate guide was uploaded successfully.
          </p>

          <p className="text-lg font-bold">
            {uploadSuccess?.count} records processed
          </p>

          <button
            type="button"
            onClick={() => setUploadSuccess(null)}
            className="w-full cursor-pointer rounded-md bg-park-green px-6 py-3 font-semibold text-white hover:bg-park-green-dark text-2xl"
          >
            Done
          </button>
        </div>
      </Modal>

      <div className="mx-2 min-h-0 flex-1 overflow-y-auto pb-10">
        {selectedTab === "Labour" && (
          <LabourTable labourRates={filteredLabourRates} />
        )}

        {selectedTab === "Equipment" && (
          <EquipmentTable equipmentRates={filteredEquipmentRates} />
        )}
        {selectedTab === "Materials" && (
          <MaterialsTable materials={filteredMaterialRates} />
        )}
        {selectedTab === "Archa Rates" && (
          <MaterialsTable materials={filteredMaterialRates} />
        )}
      </div>
    </section>
  );
}
