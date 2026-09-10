/**
 * Update Editor-in-Chief display name in users + editorial board.
 * Usage: DATABASE_URL="..." npx tsx scripts/update-eic-name.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const NAME = "Cyril John B. Domingo, PhD";
const EMAIL = "eic@sksu.edu.ph";

async function main() {
  const user = await prisma.user.updateMany({
    where: { email: EMAIL },
    data: { name: NAME },
  });
  const board = await prisma.editorialBoardMember.updateMany({
    where: {
      OR: [{ email: EMAIL }, { title: "Editor-in-Chief" }],
      deletedAt: null,
    },
    data: {
      name: NAME,
      affiliation: "Sultan Kudarat State University",
    },
  });
  console.log(`Updated users: ${user.count}, editorial board: ${board.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
