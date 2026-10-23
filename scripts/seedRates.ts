
import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";

config({ path: ".env.local" });

const labourRates = [
  {
    employeeNumber: 13201,
    baseWorkClass: "AF3",
    baseClassName: "Foreman 3",
    rate: 106.76,
    saturdayRate: 131.16,
    sundayRate: 165.41,
  },
  {
    employeeNumber: 25172,
    baseWorkClass: "AL3",
    baseClassName: "Asphalt Labourer 3",
    rate: 66.76,
    saturdayRate: 84.11,
    sundayRate: 105.8,
  },
  {
    employeeNumber: 21068,
    baseWorkClass: "BF1",
    baseClassName: "Base Foreman 1",
    rate: 103.76,
    saturdayRate: 131.16,
    sundayRate: 165.41,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const rate of labourRates) {
      await client.query(
        `
        INSERT INTO "LabourRate" (
          "id",
          "employeeNumber",
          "baseWorkClass",
          "baseClassName",
          "rate",
          "saturdayRate",
          "sundayRate",
          "createdAt",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT ("employeeNumber")
        DO UPDATE SET
          "baseWorkClass" = EXCLUDED."baseWorkClass",
          "baseClassName" = EXCLUDED."baseClassName",
          "rate" = EXCLUDED."rate",
          "saturdayRate" = EXCLUDED."saturdayRate",
          "sundayRate" = EXCLUDED."sundayRate",
          "updatedAt" = NOW()
        `,
        [
          randomUUID(),
          rate.employeeNumber,
          rate.baseWorkClass,
          rate.baseClassName,
          rate.rate,
          rate.saturdayRate,
          rate.sundayRate,
        ]
      );
    }

    await client.query("COMMIT");

    console.log(
      `${labourRates.length} labour rates seeded successfully.`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
