import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

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
  for (const labourRate of labourRates) {
    await prisma.labourRate.upsert({
      where: {
        employeeNumber: labourRate.employeeNumber,
      },
      update: {
        baseWorkClass: labourRate.baseWorkClass,
        baseClassName: labourRate.baseClassName,
        rate: labourRate.rate,
        saturdayRate: labourRate.saturdayRate,
        sundayRate: labourRate.sundayRate,
      },
      create: labourRate,
    });
  }

  console.log(`${labourRates.length} labour rates seeded successfully.`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });