import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type LabourSpreadsheetRow = {
  "Employee #"?: unknown;
  "Base Work Class"?: unknown;
  "Base Class Name"?: unknown;
  Rate?: unknown;
  "Saturday Rate"?: unknown;
  "Sunday Rate"?: unknown;
};

type EquipmentSpreadsheetRow = {
  "Equipment #"?: unknown;
  "Make,Model,Year"?: unknown;
   "Make, Model, Year"?: unknown;
   "Make, Model & Year"?: unknown;

  Description?: unknown;
  "Udf Archa Rate"?: unknown;
  HorsePower?: unknown;
  "Horse Power"?: unknown;
  Horsepower?: unknown;
};

type MaterialSpreadsheetRow = {
  Description?: unknown;
  Unit?: unknown;
};


function normalizeHeader(header: string) {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      normalizeHeader(key),
      value,
    ]),
  );
}

function getValue(
  row: Record<string, unknown>,
  aliases: string[],
) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);

    const value = row[normalizedAlias];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return "";
}


async function runInBatches<T>(
  rows: T[],
  batchSize: number,
  handler: (batch: T[]) => Promise<void>,
) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await handler(batch);
  }
}


export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const uploadedFile = formData.get("file");
    const category = formData.get("category");


    
    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "No valid spreadsheet was uploaded." },
        { status: 400 },
      );
    }

    if (
      category !== "Labour" &&
      category !== "Equipment" &&
      category !== "Materials"
    ) {
      return NextResponse.json(
        { error: "Invalid rate category." },
        { status: 400 },
      );
    }

    const fileName = uploadedFile.name.toLowerCase();

    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls") &&
      !fileName.endsWith(".csv")
    ) {
      return NextResponse.json(
        { error: "Please upload an XLSX, XLS, or CSV file." },
        { status: 400 },
      );
    }

    const fileBuffer = await uploadedFile.arrayBuffer();

    const workbook = XLSX.read(fileBuffer);

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json(
        { error: "The spreadsheet does not contain a worksheet." },
        { status: 400 },
      );
    }

    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      return NextResponse.json(
        { error: "The first worksheet could not be read." },
        { status: 400 },
      );
    }

    // -----------------------------
    // LABOUR
    // -----------------------------

    if (category === "Labour") {
      const rows =
        XLSX.utils.sheet_to_json<LabourSpreadsheetRow>(worksheet, {
          defval: "",
        });

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "The spreadsheet contains no labour-rate rows." },
          { status: 400 },
        );
      }

      const parsedRows = rows.map((row, index) => {
  const normalized = normalizeRow(
    row as Record<string, unknown>,
  );

  const employeeNumber = Number(
    getValue(normalized, [
      "Employee #",
      "Employee Number",
      "Employee No",
      "Employee ID",
    ]),
  );

  const baseWorkClass = String(
    getValue(normalized, [
      "Base Work Class",
      "Work Class",
      "Base Class",
    ]),
  ).trim();

  const baseClassName = String(
    getValue(normalized, [
      "Base Class Name",
      "Class Name",
      "Classification",
    ]),
  ).trim();

  const rate = Number(
    getValue(normalized, [
      "Rate",
      "Regular Rate",
      "Hourly Rate",
    ]),
  );

  const saturdayRate = Number(
    getValue(normalized, [
      "Saturday Rate",
      "Sat Rate",
    ]),
  );

  const sundayRate = Number(
    getValue(normalized, [
      "Sunday Rate",
      "Sun Rate",
    ]),
  );

  const spreadsheetRow = index + 2;

  if (!Number.isInteger(employeeNumber) || employeeNumber <= 0) {
    throw new Error(
      `Row ${spreadsheetRow}: Employee # must be a positive whole number.`,
    );
  }

  if (!baseWorkClass) {
    throw new Error(
      `Row ${spreadsheetRow}: Base Work Class is required.`,
    );
  }

  if (!baseClassName) {
    throw new Error(
      `Row ${spreadsheetRow}: Base Class Name is required.`,
    );
  }

  if (!Number.isFinite(rate) || rate < 0) {
    throw new Error(
      `Row ${spreadsheetRow}: Rate is invalid.`,
    );
  }

  if (!Number.isFinite(saturdayRate) || saturdayRate < 0) {
    throw new Error(
      `Row ${spreadsheetRow}: Saturday Rate is invalid.`,
    );
  }

  if (!Number.isFinite(sundayRate) || sundayRate < 0) {
    throw new Error(
      `Row ${spreadsheetRow}: Sunday Rate is invalid.`,
    );
  }

  return {
    employeeNumber,
    baseWorkClass,
    baseClassName,
    rate,
    saturdayRate,
    sundayRate,
  };
});

      await runInBatches(parsedRows, 100, async (batch) => {
  await prisma.$transaction(
    batch.map((row) =>
      prisma.labourRate.upsert({
        where: {
          employeeNumber: row.employeeNumber,
        },
        update: {
          baseWorkClass: row.baseWorkClass,
          baseClassName: row.baseClassName,
          rate: row.rate,
          saturdayRate: row.saturdayRate,
          sundayRate: row.sundayRate,
        },
        create: row,
      }),
    ),
  );
});

      return NextResponse.json({
        message: `${parsedRows.length} labour rates uploaded successfully.`,
        uploadedCount: parsedRows.length,
      });
    }

    // -----------------------------
    // EQUIPMENT
    // -----------------------------

    if (category === "Equipment") {
      const rows =
        XLSX.utils.sheet_to_json<EquipmentSpreadsheetRow>(worksheet, {
          defval: "",
        });
        console.log("EQUIPMENT HEADERS:", Object.keys(rows[0] ?? {}));
console.log("FIRST EQUIPMENT ROW:", rows[0]);
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "The spreadsheet contains no equipment-rate rows." },
          { status: 400 },
        );
      }

      const parsedRows = rows.map((row, index) => {
  const normalized = normalizeRow(
  row as Record<string, unknown>,
);

  const equipmentNumber = String(
  getValue(normalized, [
    "Equipment #",
    "Equipment Number",
    "Equipment No",
  ]),
).trim();

const makeModelYear = String(
  getValue(normalized, [
    "Make Model Year",
    "Make, Model, Year",
    "Make/Model/Year",
  ]),
).trim();

const description = String(
  getValue(normalized, [
    "Description",
    "Equipment Description",
  ]),
).trim();

const equipmentRate = Number(
  getValue(normalized, [
    "Udf Archa Rate",
    "Archa Rate",
    "Equipment Rate",
    "Rate",
  ]),
);

const horsePowerRaw = getValue(normalized, [
  "Horsepower",
  "Horse Power",
  "HP",
]);

  const horsePower =
  horsePowerRaw === ""
    ? null
    : Number(horsePowerRaw);

  const spreadsheetRow = index + 2;

  if (!equipmentNumber) {
    throw new Error(
      `Row ${spreadsheetRow}: Equipment # is required.`,
    );
  }

  if (!description) {
    throw new Error(
      `Row ${spreadsheetRow}: Description is required.`,
    );
  }

  if (
    !Number.isFinite(equipmentRate) ||
    equipmentRate < 0
  ) {
    throw new Error(
      `Row ${spreadsheetRow}: Equipment rate is invalid.`,
    );
  }

  if (
    horsePower !== null &&
    (!Number.isInteger(horsePower) ||
      horsePower < 0)
  ) {
    throw new Error(
      `Row ${spreadsheetRow}: Horse Power is invalid.`,
    );
  }

  return {
    equipmentNumber,
    makeModelYear,
    description,
    equipmentRate,
    horsePower,
  };
});

      return NextResponse.json({
        message: `${parsedRows.length} equipment rates uploaded successfully.`,
        uploadedCount: parsedRows.length,
      });
    }

    // -----------------------------
    // MATERIALS
    // -----------------------------

    if (category === "Materials") {
      const rows =
        XLSX.utils.sheet_to_json<MaterialSpreadsheetRow>(worksheet, {
          defval: "",
        });

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "The spreadsheet contains no material-rate rows." },
          { status: 400 },
        );
      }

      const parsedRows = rows.map((row, index) => {
  const normalized = normalizeRow(
    row as Record<string, unknown>,
  );

  const materialType = String(
    getValue(normalized, [
      "Description",
      "Material",
      "Material Description",
      "Material Type",
      "Type",
    ]),
  ).trim();

  const materialUnit = String(
    getValue(normalized, [
      "Unit",
      "Material Unit",
      "UOM",
      "Unit of Measure",
    ]),
  ).trim();

  const spreadsheetRow = index + 2;

  if (!materialType) {
    throw new Error(
      `Row ${spreadsheetRow}: Description is required.`,
    );
  }

  if (!materialUnit) {
    throw new Error(
      `Row ${spreadsheetRow}: Unit is required.`,
    );
  }

  return {
    materialType,
    materialUnit,
  };
});

      await runInBatches(parsedRows, 100, async (batch) => {
  await prisma.$transaction(
    batch.map((row) =>
      prisma.materialRate.upsert({
        where: {
          materialType_materialUnit: {
            materialType: row.materialType,
            materialUnit: row.materialUnit,
          },
        },
        update: {},
        create: {
          materialType: row.materialType,
          materialUnit: row.materialUnit,
        },
      }),
    ),
  );
});

      return NextResponse.json({
        message: `${parsedRows.length} material rates uploaded successfully.`,
        uploadedCount: parsedRows.length,
      });
    }

    return NextResponse.json(
      { error: "Unsupported category." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Rate upload failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The spreadsheet could not be uploaded.",
      },
      { status: 500 },
    );
  }
}