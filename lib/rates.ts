import { prisma } from "./prisma";

export type LabourRate = {
  id: string;
  employeeNumber: number;
  baseWorkClass: string;
  baseClassName: string;
  rate: number;
  saturdayRate: number;
  sundayRate: number;
};

export type EquipmentRate = {
  id: string;
  equipmentNumber: string;
  description: string;
  rate: number;
  horsePower: number | null;
  makeModelYear: string;
};

export type MaterialRate = {
  id: string;
  type: string;
  unit: string;
};




export async function getLabourRates() {
  const rates = await prisma.labourRate.findMany({
    orderBy: {
      employeeNumber: "asc",
    },
  });
  return rates.map((rate) => ({
    id: rate.id,
    employeeNumber: rate.employeeNumber,
    baseWorkClass: rate.baseWorkClass,
    baseClassName: rate.baseClassName,
    rate: Number(rate.rate),
    saturdayRate: Number(rate.saturdayRate),
    sundayRate: Number(rate.sundayRate),
  }));
}

export async function getEquipmentRates() {
  const rates = await prisma.equipmentRate.findMany({
    orderBy: {
      equipmentNumber: "asc",
    },
  });
  return rates.map((rate) => ({
    id: rate.id,
    equipmentNumber: rate.equipmentNumber,
    description: rate.description,
    rate: Number(rate.equipmentRate),
    horsePower: rate.horsePower,
    makeModelYear: rate.makeModelYear,
  }));
}

export async function getMaterialRates() {
  const rates = await prisma.materialRate.findMany({
    orderBy: {
      materialType: "asc",
    },
  });
  return rates.map((rate) => ({
    id: rate.id,
    type: rate.materialType,
    unit: rate.materialUnit,
  }));
}