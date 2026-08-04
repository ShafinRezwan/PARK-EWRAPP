import type { LabourRates, EquipmentRates, MaterialRates } from "@/types/ewr.types";

export const labourRates: LabourRates[] = [
  {
    id: 1,
    employeeNumber: 13201,
    baseWorkClass: "AF3",
    baseClassName: "Foreman 3",
    rate: 106.76,
    saturdayRate: 131.16,
    sundayRate: 165.41,
  },
  {
    id: 2,
    employeeNumber: 25172,
    baseWorkClass: "AL3",
    baseClassName: "Asphalt Labourer 3",
    rate: 66.76,
    saturdayRate: 84.11,
    sundayRate: 105.80,
  },
   {
    id: 3,
    employeeNumber: 21068,
    baseWorkClass: "BF3",
    baseClassName: "Base Foreman 1",
    rate: 103.76,
    saturdayRate: 131.16,
    sundayRate: 165.41,
  },
  
];

export const equipmentRates: EquipmentRates[] = [
  {
    id: 1,
    equipmentNumber: 1001,
    makeModelYear: "Caterpillar D3",
    description: "Dozer",
    rate: "150.00",
    horsePower: "150",
  },
  {
    id: 2,
    equipmentNumber: 1002,
    makeModelYear: "John Deere E3",
    description: "Excavator",
    rate: "200.00",
    horsePower: "200",
  },
  {
    id: 3,
    equipmentNumber: 1003,
    makeModelYear: "Komatsu D3",
    description: "Bulldozer",
    rate: "180.00",
    horsePower: "180",
  },
  {
    id: 4,
    equipmentNumber: 1004,
    makeModelYear: "Chevy 2020",
    description: "1 Ton Truck",
    rate: "210.00",
    horsePower: "250",
  },

];

export const materialRates: MaterialRates[] = [
  {
    id: 1,
    description: "Asphalt",
    unit: "TE",
    rate: "",
  },
  {
    id: 2,
    description: "Concrete",
    unit: "M3",
    rate: "",
  },
  {
    id: 3,
    description: "Gravel",
    unit: "M3",
    rate: "",
  },

];
 