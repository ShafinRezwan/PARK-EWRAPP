import React from "react";
import PageTransition from "@/components/PageTransition";
import { getLabourRates } from "@/lib/rates";

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

export default function LabourTable({ labourRates }: Props) {
  return (
    <>
      <PageTransition>
        <table className="w-full border-collapse  text-left ">
          <thead className="sticky top-0 text-2xl text-park-gray bg-white ">
            <tr>
              <th className="px-3 py-1 text-center underline ">Employee #</th>
              <th className="px-3 py-1 text-center underline">
                Base Work Class
              </th>
              <th className="px-3 py-1 text-center underline ">
                Base Class Name
              </th>
              <th className="px-3 py-1 text-center underline">Rate</th>
              <th className="px-3 py-1 text-center underline">Saturday Rate</th>
              <th className="px-3 py-1 text-center underline">Sunday Rate</th>
            </tr>
          </thead>
          <tbody className="text-xl text-black">
            {labourRates.map((labour) => (
              <tr key={labour.id} className="border-b-2 border-park-gray">
                <td className="px-3 py-3 text-center">
                  {labour.employeeNumber}
                </td>

                <td className="px-3 py-3 text-center">
                  {labour.baseWorkClass}
                </td>

                <td className="px-3 py-3 text-center">
                  {labour.baseClassName}
                </td>

                <td className="px-3 py-3 text-center">{"$" + labour.rate}</td>
                <td className="px-3 py-3 text-center">
                  {"$" + labour.saturdayRate}
                </td>
                <td className="px-3 py-3 text-center">
                  {"$" + labour.sundayRate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageTransition>
    </>
  );
}
