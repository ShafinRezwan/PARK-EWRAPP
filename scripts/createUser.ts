import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
//npm run create:user -- john@example.com "MyPassword123!" John Smith ADMIN
async function main() {
      if (process.env.NODE_ENV === "production") {
  throw new Error(
    "This cleanup script cannot run in production.",
  );
}
  // -----------------------------------------
  // Get arguments
  // -----------------------------------------

  const [
    emailArg,
    passwordArg,
    firstNameArg,
    lastNameArg,
    roleArg,
  ] = process.argv.slice(2);

  const email = emailArg?.trim().toLowerCase();
  const password = passwordArg;
  const firstName = firstNameArg?.trim();
  const lastName = lastNameArg?.trim();

  const role =
    roleArg?.trim().toUpperCase() || "CONTRACTS";

  // -----------------------------------------
  // Validation
  // -----------------------------------------

  if (!email) {
    throw new Error("Email is required.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  if (!firstName) {
    throw new Error("First name is required.");
  }

  if (!lastName) {
    throw new Error("Last name is required.");
  }

  const allowedRoles = [
    "ADMIN",
    "CONTRACTS",
    "SUPERINTENDENT",
    "ACCOUNTING",
    "PROJECT_MANAGER",
    "MASTER_USER",
  ] as const;

  if (
    !allowedRoles.includes(
      role as (typeof allowedRoles)[number],
    )
  ) {
    throw new Error(
      `Invalid role "${role}". Valid roles are: ${allowedRoles.join(", ")}`,
    );
  }

  // -----------------------------------------
  // Check if user already exists
  // -----------------------------------------

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingUser) {
    throw new Error(
      `A user with the email ${email} already exists.`,
    );
  }

  // -----------------------------------------
  // Hash password
  // -----------------------------------------

  const hashedPassword =
    await bcrypt.hash(password, 12);

  // -----------------------------------------
  // Create user
  // -----------------------------------------

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,

      role:
        role as
          | "ADMIN"
          | "CONTRACTS"
          | "SUPERINTENDENT"
          | "ACCOUNTING"
          | "PROJECT_MANAGER"
          | "MASTER_USER",
    },
  });

  // -----------------------------------------
  // Success
  // -----------------------------------------

  console.log("\nUser created successfully.");

  console.log("-----------------------------");
  console.log(`Name:  ${user.firstName} ${user.lastName}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role:  ${user.role}`);
  console.log(`ID:    ${user.id}`);
  console.log("-----------------------------");
}

main()
  .catch((error) => {
    console.error("\nUnable to create user:");

    console.error(
      error instanceof Error
        ? error.message
        : error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });