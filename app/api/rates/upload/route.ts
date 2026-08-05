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

    if (category !== "Labour") {
      return NextResponse.json(
        { error: "Only Labour uploads are supported right now." },
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

    const rows = XLSX.utils.sheet_to_json<LabourSpreadsheetRow>(worksheet, {
      defval: "",
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "The spreadsheet contains no labour-rate rows." },
        { status: 400 },
      );
    }

    const parsedRows = rows.map((row, index) => {
      const employeeNumber = Number(row["Employee #"]);
      const baseWorkClass = String(row["Base Work Class"] ?? "").trim();
      const baseClassName = String(row["Base Class Name"] ?? "").trim();
      const rate = Number(row.Rate);
      const saturdayRate = Number(row["Saturday Rate"]);
      const sundayRate = Number(row["Sunday Rate"]);

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
        throw new Error(`Row ${spreadsheetRow}: Rate is invalid.`);
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

    await prisma.$transaction(
      parsedRows.map((row) =>
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
          create: {
            employeeNumber: row.employeeNumber,
            baseWorkClass: row.baseWorkClass,
            baseClassName: row.baseClassName,
            rate: row.rate,
            saturdayRate: row.saturdayRate,
            sundayRate: row.sundayRate,
          },
        }),
      ),
    );

    return NextResponse.json({
      message: `${parsedRows.length} labour rates uploaded successfully.`,
      uploadedCount: parsedRows.length,
    });
  } catch (error) {
    console.error("Labour-rate upload failed:", error);

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