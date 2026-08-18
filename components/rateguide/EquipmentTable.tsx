import React from "react";
import PageTransition from "@/components/PageTransition";
import { EquipmentRate } from "@/lib/rates";

type Props = {
  equipmentRates: EquipmentRate[];
};

export default function EquipmentTable({ equipmentRates }: Props) {
  return (
    <>
      <PageTransition>
        <table className="w-full border-collapse text-left ">
          <thead className="sticky top-0 text-2xl text-park-gray bg-white ">
            <tr>
              <th className="px-3 py-1 text-center underline  whitespace-nowrap">
                Equipment Number
              </th>
              <th className="px-3 py-1 text-center underline whitespace-nowrap ">
                Description
              </th>
              <th className="px-3 py-1 text-center underline whitespace-nowrap">
                Make, Model, Year
              </th>
              <th className="px-3 py-1 text-center underline whitespace-nowrap">
                Rate
              </th>
              <th className="px-3 py-1 text-center underline whitespace-nowrap">
                Horse Power
              </th>
            </tr>
          </thead>
          <tbody className="text-xl text-black">
            {equipmentRates.map((equipment) => (
              <tr key={equipment.id} className="border-b-2 border-park-gray">
                <td className="px-3 py-3 text-center">
                  {equipment.equipmentNumber}
                </td>

                <td className="px-3 py-3 text-center">
                  {equipment.description}
                </td>

                <td className="px-3 py-3 text-center">
                  {equipment.makeModelYear}
                </td>

                <td className="px-3 py-3 text-center">
                  {"$" + equipment.rate.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-center">
                  {equipment.horsePower ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageTransition>
    </>
  );
}
