import "dotenv/config";
import { prisma } from "../lib/prisma";
//npm run delete:user -- user@example.com
async function main() {

      if (process.env.NODE_ENV === "production") {
  throw new Error(
    "This cleanup script cannot run in production.",
  );
}
  // -----------------------------------------
  // Get email from command line
  // -----------------------------------------

  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      "Please provide the email of the user you want to delete.",
    );
  }

  console.log(`Looking for user: ${email}`);

  // -----------------------------------------
  // Find user
  // -----------------------------------------

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error(
      `No user was found with email: ${email}`,
    );
  }

  // -----------------------------------------
  // Delete user
  // -----------------------------------------

  await prisma.user.delete({
    where: {
      id: user.id,
    },
  });

  console.log(
    `Deleted user: ${user.firstName} ${user.lastName} (${user.email})`,
  );
}

main()
  .catch((error) => {
    console.error("Unable to delete user:");

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