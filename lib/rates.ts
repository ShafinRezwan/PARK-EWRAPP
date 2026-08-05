import { prisma } from "./prisma";

export async function getLabourRates() {
  return prisma.labourRate.findMany({
    orderBy: {
      employeeNumber: "asc",
    },
  });
}

export async function getEquipmentRates() {
  return prisma.labourRate.findMany({
    orderBy: {
      employeeNumber: "asc",
    },
  });
}

export async function getMaterialRates() {
  return prisma.labourRate.findMany({
    orderBy: {
      employeeNumber: "asc",
    },
  });
}