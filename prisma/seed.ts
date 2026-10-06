import { prisma } from "../src/shared/db/client";

async function main() {
  console.log("🌱 TypeScript seed runner synced.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
