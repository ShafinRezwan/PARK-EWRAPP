"use client";

import { useState } from "react";
import { Button } from "@base-ui/react";

import Modal from "../Modal";
import CreateUploadDataModal from "@/components/rateguide/CreateUploadDataModal";
import LabourTable from "./LabourTable";
import MaterialsTable from "./MaterialsTable";
import EquipmentTable from "./EquipmentTable";

type LabourRate = {
  id: string;
  employeeNumber: number;
  baseWorkClass: string;
  baseClassName: string;
  rate: number;
  saturdayRate: number;
  sundayRate: number;
};

type Props = {
  labourRates: LabourRate[];
};

export default function RateTable({ labourRates }: Props) {
  const tabs = ["Labour", "Equipment", "Materials"] as const;

  const [uploadModal, setShowUploadModal] = useState(false);

  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("Labour");

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border-[3px] border-black">
      <div className="flex h-24">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedTab(tab)}
            className={`
              cursor-pointer
              text-3xl
              font-semibold
              text-white
              transition-all
              duration-500
              ease-in-out
              ${selectedTab === tab ? "flex-1" : "w-40"}
              ${
                tab === "Labour"
                  ? "bg-[#2CAB5D]"
                  : tab === "Equipment"
                    ? "bg-[#C90202]"
                    : "bg-[#2C4EAB]"
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
          placeholder="Search"
          className="max-w-sm rounded-md border-[3px] border-black px-3 py-2 text-xl text-park-gray outline-none transition focus:border-park-green"
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
        />
      </Modal>

      <div className="mx-2 min-h-0 flex-1 overflow-y-auto pb-10">
        {selectedTab === "Labour" && <LabourTable labourRates={labourRates} />}

        {selectedTab === "Equipment" && <EquipmentTable />}

        {selectedTab === "Materials" && <MaterialsTable />}
      </div>
    </section>
  );
}
