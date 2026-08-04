"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@base-ui/react";
import Modal from "../Modal";
import CreateUploadDataModal from "@/components/rateguide/CreateUploadDataModal";
import LabourTable from "./LabourTable";
import MaterialsTable from "./MaterialsTable";
import EquipmentTable from "./EquipmentTable";

export default function RateTable() {
  const tabs = ["Labour", "Equipment", "Materials"] as const;
  const [uploadModal, setShowUploadModal] = useState(false);
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("Labour");
  const activeIndex = tabs.indexOf(selectedTab);
  /*
  const filteredReports = reports.filter((report) => {
    const matchesDivision =
      selectedDivision === "All" || report.divisionCode === selectedDivision;

    const matchesYear = selectYear === "All" || report.year === selectYear;

    return matchesDivision && matchesYear;
  });
  */

  return (
    <>
      <section className="flex h-full flex-col  overflow-hidden rounded-md  border-[3px] border-black ">
        <div className="flex h-24 ">
          {tabs.map((tab) => (
            <button
              key={tab}
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

        <div className="flex justify-between  px-3 py-2">
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search"
            className=" max-w-sm rounded-md border-[3px] border-black px-3 py-2  text-xl text-park-gray outline-none transition focus:border-park-green"
          />
          <Button
            type="button"
            className="rounded-md bg-park-green px-10 py-3 transition-all duration-200 text-xl text-white cursor-pointer hover:bg-park-green-dark"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Data
          </Button>
          <Modal isOpen={uploadModal} onClose={() => setShowUploadModal(false)}>
            <CreateUploadDataModal
              category={selectedTab}
              onClose={() => setShowUploadModal(false)}
            />
          </Modal>
        </div>
        <div className="max-h-400 overflow-y-auto pb-10 mx-2">
          {selectedTab === "Labour" && <LabourTable />}
          {selectedTab === "Equipment" && <EquipmentTable />}
          {selectedTab === "Materials" && <MaterialsTable />}
        </div>
      </section>
    </>
  );
}
