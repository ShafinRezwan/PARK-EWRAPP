import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const password = "Test!";

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: {
      email: "scott@ppl.com",
    },

    update: {
      firstName: "Scott",
      lastName: "Hyde",
      password: hashedPassword,
    },

    create: {
      firstName: "Scott",
      lastName: "Hyde",
      email: "scott@ppl.com",
      password: hashedPassword,
    },
  });

  console.log("User created/updated:", {
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });