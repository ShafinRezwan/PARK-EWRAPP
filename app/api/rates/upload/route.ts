import { NextResponse } from "next/server";

import { randomUUID } from "node:crypto";

import * as XLSX from "xlsx";

import { pool } from "@/lib/db";

import { getCurrentUser } from "@/lib/auth";



export const runtime = "nodejs";



type Category = "Labour" | "Equipment" | "Materials";

type SpreadsheetRow = Record<string, unknown>;



class UploadValidationError extends Error {}



function normalizeHeader(value: string): string {

  return value.toLowerCase().replace(/[^a-z0-9]/g, "");

}



function normalizeRow(row: SpreadsheetRow): SpreadsheetRow {

  return Object.fromEntries(

    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])

  );

}



function getValue(row: SpreadsheetRow, aliases: string[]): unknown {

  for (const alias of aliases) {

    const value = row[normalizeHeader(alias)];

    if (value !== undefined && value !== null && value !== "") return value;

  }

  return "";

}



function textValue(row: SpreadsheetRow, aliases: string[]): string {

  return String(getValue(row, aliases)).trim();

}



function numberValue(row: SpreadsheetRow, aliases: string[]): number {

  const raw = getValue(row, aliases);

  return raw === "" ? Number.NaN : Number(raw);

}



function requireText(value: string, row: number, label: string): void {

  if (!value) throw new UploadValidationError(`Row ${row}: ${label} is required.`);

}



function requireMoney(value: number, row: number, label: string): void {

  if (!Number.isFinite(value) || value < 0 || value > 99_999_999.99 ||

      Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) {

    throw new UploadValidationError(`Row ${row}: ${label} must be a valid nonnegative amount with at most two decimals.`);

  }

}



function parseLabour(row: SpreadsheetRow, index: number) {

  const r = normalizeRow(row), n = index + 2;

  const employeeNumber = numberValue(r, ["Employee", "Employee #", "Employee Number", "Employee No", "Employee ID"]);

  const baseWorkClass = textValue(r, ["Base Work Class", "Work Class", "Base Class"]);

  const baseClassName = textValue(r, ["Base Class Name", "Class Name", "Classification"]);

  const rate = numberValue(r, ["Rate", "Regular Rate", "Hourly Rate"]);

  const saturdayRate = numberValue(r, ["Saturday Rate", "Sat Rate"]);

  const sundayRate = numberValue(r, ["Sunday Rate", "Sun Rate"]);

  if (!Number.isSafeInteger(employeeNumber) || employeeNumber <= 0 || employeeNumber > 2147483647)

    throw new UploadValidationError(`Row ${n}: Employee # must be a positive whole number.`);

  requireText(baseWorkClass, n, "Base Work Class");

  requireText(baseClassName, n, "Base Class Name");

  requireMoney(rate, n, "Rate");

  requireMoney(saturdayRate, n, "Saturday Rate");

  requireMoney(sundayRate, n, "Sunday Rate");

  return { employeeNumber, baseWorkClass, baseClassName, rate, saturdayRate, sundayRate };

}



function parseEquipment(row: SpreadsheetRow, index: number) {

  const r = normalizeRow(row), n = index + 2;

  const equipmentNumber = textValue(r, ["Equipment", "Equipment #", "Equipment Number", "Equipment No"]);

  const makeModelYear = textValue(r, ["Make Model Year", "Make, Model, Year", "Make, Model,Year", "Make/Model/Year", "Make, Model & Year"]);

  const description = textValue(r, ["Description", "Equipment Description"]);

  const equipmentRate = numberValue(r, ["Udf Arhca Rate", "Udf Archa Rate", "Arhca Rate", "Archa Rate", "Equipment Rate", "Rate"]);

  const hpRaw = getValue(r, ["Horsepower", "Horse Power", "HP"]);

  const horsePower = hpRaw === "" ? null : Number(hpRaw);

  requireText(equipmentNumber, n, "Equipment");

  requireText(makeModelYear, n, "Make, Model & Year");

  requireText(description, n, "Description");

  requireMoney(equipmentRate, n, "Equipment rate");

  if (horsePower !== null && (!Number.isInteger(horsePower) || horsePower < 0 || horsePower > 2147483647))

    throw new UploadValidationError(`Row ${n}: Horse Power is invalid.`);

  return { equipmentNumber, makeModelYear, description, equipmentRate, horsePower };

}



function parseMaterial(row: SpreadsheetRow, index: number) {

  const r = normalizeRow(row), n = index + 2;

  const materialType = textValue(r, ["Description", "Material", "Material Description", "Material Type", "Type"]);

  const materialUnit = textValue(r, ["Unit", "Material Unit", "UOM", "Unit of Measure"]);

  requireText(materialType, n, "Description");

  requireText(materialUnit, n, "Unit");

  return { materialType, materialUnit };

}



export async function POST(request: Request) {

  try {

    const user = await getCurrentUser();

    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    if (!(["MASTER_USER", "ADMIN"] as string[]).includes(user.role))

      return NextResponse.json({ error: "Forbidden." }, { status: 403 });



// Also configure an upload-size limit at your reverse proxy.

    const formData = await request.formData();

    const file = formData.get("file");

    const category = formData.get("category");

    if (!(file instanceof File))

      return NextResponse.json({ error: "No valid spreadsheet was uploaded." }, { status: 400 });

    if (category !== "Labour" && category !== "Equipment" && category !== "Materials")

      return NextResponse.json({ error: "Invalid rate category." }, { status: 400 });

    if (!/\.(xlsx|xls|csv)$/i.test(file.name))

      return NextResponse.json({ error: "Please upload an XLSX, XLS, or CSV file." }, { status: 400 });

    if (file.size === 0 || file.size > 10 * 1024 * 1024)

      return NextResponse.json({ error: "Spreadsheet must be between 1 byte and 10 MB." }, { status: 413 });



    let workbook: XLSX.WorkBook;

    try {

      workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });

    } catch {

      throw new UploadValidationError("Unable to read spreadsheet format.");

    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) throw new UploadValidationError("The spreadsheet does not contain a worksheet.");

    const sheet = workbook.Sheets[sheetName];

    if (!sheet) throw new UploadValidationError("The first worksheet could not be read.");

    // Labour uploads use the six columns from the company rate guide.
  // Other columns (Active, First Name, Last Name, etc.) are ignored.
  if (category === "Labour") {
    const headerRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
    });
    const headers = (headerRows[0] ?? []).map((value) => normalizeHeader(String(value ?? "")));
    const requiredHeaders = [
      ["Employee", ["Employee", "Employee #", "Employee Number", "Employee No", "Employee ID"]],
      ["Base Work Class", ["Base Work Class", "Work Class", "Base Class"]],
      ["Base Class Name", ["Base Class Name", "Class Name", "Classification"]],
      ["Rate", ["Rate", "Regular Rate", "Hourly Rate"]],
      ["Saturday Rate", ["Saturday Rate", "Sat Rate"]],
      ["Sunday Rate", ["Sunday Rate", "Sun Rate"]],
    ] as const;
    const missing = requiredHeaders
      .filter(([, aliases]) => !aliases.some((alias) => headers.includes(normalizeHeader(alias))))
      .map(([label]) => label);
    if (missing.length) {
      throw new UploadValidationError(`Missing labour rate columns: ${missing.join(", ")}.`);
    }
  }

  // Equipment uploads match headers by name, not column position.
  // Category, Category Name and Adjust Hours are intentionally ignored.
  if (category === "Equipment") {
    const headerRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
    });
    const headers = (headerRows[0] ?? []).map((value) => normalizeHeader(String(value ?? "")));
    const requiredHeaders = [
      ["Equipment", ["Equipment", "Equipment #", "Equipment Number", "Equipment No"]],
      ["Make, Model & Year", ["Make, Model & Year", "Make Model Year", "Make, Model, Year", "Make/Model/Year"]],
      ["Description", ["Description", "Equipment Description"]],
      ["Udf Arhca Rate", ["Udf Arhca Rate", "Udf Archa Rate", "Arhca Rate", "Archa Rate", "Equipment Rate", "Rate"]],
      ["HORSEPOWER", ["HORSEPOWER", "Horse Power", "HP"]],
    ] as const;
    const missing = requiredHeaders
      .filter(([, aliases]) => !aliases.some((alias) => headers.includes(normalizeHeader(alias))))
      .map(([label]) => label);
    if (missing.length) {
      throw new UploadValidationError(`Missing equipment rate columns: ${missing.join(", ")}.`);
    }
  }

  const rows = XLSX.utils.sheet_to_json<SpreadsheetRow>(sheet, { defval: "" });

    if (!rows.length) throw new UploadValidationError(`The spreadsheet contains no ${category.toLowerCase()}-rate rows.`);

    if (rows.length > 20_000) throw new UploadValidationError("Spreadsheet exceeds the 20,000-row import limit.");



// Import only valid, complete equipment rows. Preserve Excel row numbers for diagnostics.
    let skippedCount = 0;
    const skippedRows: { row: number; reason: string }[] = [];

    // Parse and validate all included rows before starting a transaction.
    const parsed = category === "Labour"
      ? rows.map(parseLabour)
      : category === "Equipment"
        ? rows.flatMap((row, index) => {
            try {
              return [parseEquipment(row, index)];
            } catch (error) {
              if (error instanceof UploadValidationError) {
                skippedCount++;
                skippedRows.push({ row: index + 2, reason: error.message });
                return [];
              }
              throw error;
            }
          })
        : rows.map(parseMaterial);

    if (category === "Equipment" && parsed.length === 0) {
      throw new UploadValidationError(
        `No valid equipment rows found. ${skippedCount} rows skipped. Nothing was imported.`
      );
    }

        if (category === "Labour") {
    const seen = new Set<number>();
    for (const row of parsed as ReturnType<typeof parseLabour>[]) {
      if (seen.has(row.employeeNumber)) {
        throw new UploadValidationError(`Duplicate Employee number ${row.employeeNumber} in spreadsheet.`);
      }
      seen.add(row.employeeNumber);
    }
  }

  if (category === "Equipment") {
    const seen = new Set<string>();
    for (const row of parsed as ReturnType<typeof parseEquipment>[]) {
      const key = row.equipmentNumber.toLowerCase();
      if (seen.has(key)) {
        throw new UploadValidationError(`Duplicate Equipment number ${row.equipmentNumber} in spreadsheet. Resolve duplicates before uploading.`);
      }
      seen.add(key);
    }
  }

  const client = await pool.connect();

    try {

      await client.query("BEGIN");

      if (category === "Labour") {

        for (const row of parsed as ReturnType<typeof parseLabour>[]) {

          await client.query(

            `INSERT INTO "LabourRate"

             ("id", "employeeNumber", "baseWorkClass", "baseClassName", "rate", "saturdayRate", "sundayRate", "createdAt", "updatedAt")

             VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())

             ON CONFLICT ("employeeNumber") DO UPDATE SET

               "baseWorkClass" = EXCLUDED."baseWorkClass",

               "baseClassName" = EXCLUDED."baseClassName",

               "rate" = EXCLUDED."rate",

               "saturdayRate" = EXCLUDED."saturdayRate",

               "sundayRate" = EXCLUDED."sundayRate",

               "updatedAt" = NOW()`,

            [randomUUID(), row.employeeNumber, row.baseWorkClass, row.baseClassName, row.rate, row.saturdayRate, row.sundayRate]

          );

        }

      } else if (category === "Equipment") {

        for (const row of parsed as ReturnType<typeof parseEquipment>[]) {

          await client.query(

            `INSERT INTO "EquipmentRate"

             ("id", "equipmentNumber", "makeModelYear", "description", "equipmentRate", "horsePower", "createdAt", "updatedAt")

             VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())

             ON CONFLICT ("equipmentNumber") DO UPDATE SET

               "makeModelYear" = EXCLUDED."makeModelYear",

               "description" = EXCLUDED."description",

               "equipmentRate" = EXCLUDED."equipmentRate",

               "horsePower" = EXCLUDED."horsePower",

               "updatedAt" = NOW()`,

            [randomUUID(), row.equipmentNumber, row.makeModelYear, row.description, row.equipmentRate, row.horsePower]

          );

        }

      } else {

        for (const row of parsed as ReturnType<typeof parseMaterial>[]) {

          await client.query(

            `INSERT INTO "MaterialRate" ("id", "materialType", "materialUnit")

             VALUES ($1,$2,$3)

             ON CONFLICT ("materialType", "materialUnit") DO NOTHING`,

            [randomUUID(), row.materialType, row.materialUnit]

          );

        }

      }

      await client.query("COMMIT");

    } catch (error) {

      try { await client.query("ROLLBACK"); } catch (rollbackError) {

        console.error("RATE UPLOAD ROLLBACK ERROR:", rollbackError);

      }

      throw error;

    } finally {

      client.release();

    }



    const categoryName = category === "Materials" ? "material" : category.toLowerCase();

    return NextResponse.json({
      message: `${parsed.length} ${categoryName} rates uploaded successfully.${skippedCount ? ` ${skippedCount} invalid or incomplete equipment rows skipped.` : ""}`,
      uploadedCount: parsed.length,
      skippedCount,
      skippedRows,
    });

  } catch (error) {

    if (error instanceof UploadValidationError)

      return NextResponse.json({ error: error.message }, { status: 400 });

    console.error("RATE UPLOAD ERROR:", error);

    return NextResponse.json({ error: "The spreadsheet could not be uploaded." }, { status: 500 });

  }

}
