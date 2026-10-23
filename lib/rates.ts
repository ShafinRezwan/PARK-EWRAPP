
import "server-only";

import { pool } from "./db";

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

// Labour Rates
export async function getLabourRates(): Promise<LabourRate[]> {
  const result = await pool.query<{
    id: string;
    employeeNumber: number;
    baseWorkClass: string;
    baseClassName: string;
    rate: string;
    saturdayRate: string;
    sundayRate: string;
  }>(
    `SELECT
       "id",
       "employeeNumber",
       "baseWorkClass",
       "baseClassName",
       "rate",
       "saturdayRate",
       "sundayRate"
     FROM "LabourRate"
     ORDER BY "employeeNumber" ASC`
  );

  return result.rows.map((rate) => ({
    id: rate.id,
    employeeNumber: rate.employeeNumber,
    baseWorkClass: rate.baseWorkClass,
    baseClassName: rate.baseClassName,
    rate: Number(rate.rate),
    saturdayRate: Number(rate.saturdayRate),
    sundayRate: Number(rate.sundayRate),
  }));
}

// Equipment Rates
export async function getEquipmentRates(): Promise<EquipmentRate[]> {
  const result = await pool.query<{
    id: string;
    equipmentNumber: string;
    description: string;
    equipmentRate: string;
    horsePower: number | null;
    makeModelYear: string;
  }>(
    `SELECT
       "id",
       "equipmentNumber",
       "description",
       "equipmentRate",
       "horsePower",
       "makeModelYear"
     FROM "EquipmentRate"
     ORDER BY "equipmentNumber" ASC`
  );

  return result.rows.map((rate) => ({
    id: rate.id,
    equipmentNumber: rate.equipmentNumber,
    description: rate.description,
    rate: Number(rate.equipmentRate),
    horsePower: rate.horsePower,
    makeModelYear: rate.makeModelYear,
  }));
}

// Material Rates
export async function getMaterialRates(): Promise<MaterialRate[]> {
  const result = await pool.query<{
    id: string;
    materialType: string;
    materialUnit: string;
  }>(
    `SELECT
       "id",
       "materialType",
       "materialUnit"
     FROM "MaterialRate"
     ORDER BY "materialType" ASC`
  );

  return result.rows.map((rate) => ({
    id: rate.id,
    type: rate.materialType,
    unit: rate.materialUnit,
  }));
}
