import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function main() {}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
