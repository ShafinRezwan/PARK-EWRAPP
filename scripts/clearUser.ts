
import "dotenv/config";
import { Pool } from "pg";

// Usage:
// npm run clear:user -- user@example.com

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "This cleanup script cannot run in production."
    );
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      "Please provide the email of the user you want to delete."
    );
  }

  console.log(`Looking for user: ${email}`);

  const result = await pool.query<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>(
    `
    SELECT
      "id",
      "firstName",
      "lastName",
      "email"
    FROM "User"
    WHERE "email" = $1
    `,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error(
      `No user was found with email: ${email}`
    );
  }

  await pool.query(
    `
    DELETE FROM "User"
    WHERE "id" = $1
    `,
    [user.id]
  );

  console.log(
    `Deleted user: ${user.firstName} ${user.lastName} (${user.email})`
  );
}

main()
  .catch((error) => {
    console.error("Unable to delete user:");

    console.error(
      error instanceof Error ? error.message : error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
