
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";

// Load local development environment variables.
config({ path: ".env.local" });

// Usage:
// npm run create:user -- john@example.com "MyPassword123!" John Smith ADMIN

const allowedRoles = [
  "ADMIN",
  "CONTRACTS",
  "SUPERINTENDENT",
  "ACCOUNTING",
  "PROJECT_MANAGER",
  "MASTER_USER",
] as const;

type Role = (typeof allowedRoles)[number];

type CreatedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

async function main() {
  // Never run this development script in production.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "This user creation script cannot run in production."
    );
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing from .env.local."
    );
  }

  // Prevent accidentally creating users in a remote database.
  const url = new URL(databaseUrl);

  if (
    !["localhost", "127.0.0.1", "::1"].includes(
      url.hostname
    )
  ) {
    throw new Error(
      "This script only allows local PostgreSQL connections."
    );
  }

  if (url.pathname !== "/ewr_development") {
    throw new Error(
      "This script must connect to ewr_development."
    );
  }

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

  const role = (
    roleArg?.trim().toUpperCase() || "CONTRACTS"
  ) as Role;

  // Validate input.
  if (!email) {
    throw new Error("Email is required.");
  }

  if (!password || password.length < 12) {
    throw new Error(
      "Password must be at least 12 characters."
    );
  }

  if (!firstName) {
    throw new Error("First name is required.");
  }

  if (!lastName) {
    throw new Error("Last name is required.");
  }

  if (!allowedRoles.includes(role)) {
    throw new Error(
      `Invalid role "${role}". Valid roles: ${allowedRoles.join(", ")}`
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Check for an existing user.
    const existingUser = await pool.query(
      `
      SELECT "id"
      FROM "User"
      WHERE "email" = $1
      LIMIT 1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error(
        `A user with the email ${email} already exists.`
      );
    }

    // Hash the password using bcrypt.
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // Create the user.
    const result = await pool.query<CreatedUser>(
      `
      INSERT INTO "User" (
        "id",
        "email",
        "password",
        "firstName",
        "lastName",
        "role",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::"Role",
        NOW(),
        NOW()
      )
      RETURNING
        "id",
        "email",
        "firstName",
        "lastName",
        "role"
      `,
      [
        randomUUID(),
        email,
        hashedPassword,
        firstName,
        lastName,
        role,
      ]
    );

    const user = result.rows[0];

    console.log("\nUser created successfully.");
    console.log("-----------------------------");
    console.log(
      `Name:  ${user.firstName} ${user.lastName}`
    );
    console.log(`Email: ${user.email}`);
    console.log(`Role:  ${user.role}`);
    console.log(`ID:    ${user.id}`);
    console.log("-----------------------------");
  } catch (error) {
    // PostgreSQL unique constraint violation.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new Error(
        `A user with the email ${email} already exists.`
      );
    }

    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\nUnable to create user:");
  console.error(
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
