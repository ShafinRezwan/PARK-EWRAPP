import React from "react";
import PageTransition from "@/components/PageTransition";
import { MaterialRate } from "@/lib/rates";

type Props = {
  materials: MaterialRate[];
};

export default function MaterialsTable({ materials }: Props) {
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
            {materials.map((material) => (
              <tr key={material.id} className="border-b-2 border-park-gray">
                <td className="px-3 py-3 text-center">{material.type}</td>

                <td className="px-3 py-3 text-center">{material.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageTransition>
    </>
  );
}
