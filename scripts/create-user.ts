import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const password = "Test!";

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName: "Shafin",
      lastName: "Rezwan",
      email: "shafin@example.com",
      password: hashedPassword,
    },
  });

  console.log("User created:", {
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