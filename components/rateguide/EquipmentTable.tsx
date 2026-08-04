import React from "react";
import { equipmentRates } from "@/data/ratetable-data";
import PageTransition from "@/components/PageTransition";

export default function EquipmentTable() {
  return (
    <>
      <PageTransition>
        <table className="w-full border-collapse text-left ">
          <thead className="sticky top-0 text-2xl text-park-gray bg-white ">
            <tr>
              <th className="px-3 py-1 text-center underline ">
                Equipment Number
              </th>
              <th className="px-3 py-1 text-center underline">
                Make, Model, Year
              </th>
              <th className="px-3 py-1 text-center underline ">Description</th>
              <th className="px-3 py-1 text-center underline">Rate</th>
              <th className="px-3 py-1 text-center underline">Horse Power</th>
            </tr>
          </thead>
          <tbody className="text-xl text-black">
            {equipmentRates.map((equipment) => (
              <tr key={equipment.id} className="border-b-2 border-park-gray">
                <td className="px-3 py-3 text-center">
                  {equipment.equipmentNumber}
                </td>

                <td className="px-3 py-3 text-center">
                  {equipment.makeModelYear}
                </td>

                <td className="px-3 py-3 text-center">
                  {equipment.description}
                </td>

                <td className="px-3 py-3 text-center">{equipment.rate}</td>
                <td className="px-3 py-3 text-center">
                  {equipment.horsePower}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageTransition>
    </>
  );
}
