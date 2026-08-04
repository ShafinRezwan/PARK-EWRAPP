import React from "react";
import { materialRates } from "@/data/ratetable-data";
import PageTransition from "@/components/PageTransition";

export default function MaterialsTable() {
  return (
    <>
      <PageTransition>
        <table className="w-full border-collapse text-left ">
          <thead className="sticky top-0 text-2xl text-park-gray bg-white ">
            <tr>
              <th className="px-3 py-1 text-center underline ">Description</th>
              <th className="px-3 py-1 text-center underline">Unit</th>
            </tr>
          </thead>
          <tbody className="text-xl text-black">
            {materialRates.map((material) => (
              <tr key={material.id} className="border-b-2 border-park-gray">
                <td className="px-3 py-3 text-center">
                  {material.description}
                </td>

                <td className="px-3 py-3 text-center">{material.unit}</td>

                <td className="px-3 py-3 text-center">{material.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageTransition>
    </>
  );
}
