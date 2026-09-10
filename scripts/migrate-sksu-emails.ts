/**
 * Migrate editorial login emails to @sksu.edu.ph
 * Usage: DATABASE_URL="..." npx tsx scripts/migrate-sksu-emails.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCAL_PARTS = ["superadmin", "eic", "managing", "section", "reviewer", "author"] as const;
const LEGACY_DOMAINS = ["journals.local", "journals.edu.ph"] as const;

async function main() {
  for (const local of LOCAL_PARTS) {
    const to = `${local}@sksu.edu.ph`;
    const existing = await prisma.user.findUnique({ where: { email: to } });
    if (existing) {
      console.log(`OK ${to}`);
      continue;
    }
    let moved = 0;
    for (const domain of LEGACY_DOMAINS) {
      const from = `${local}@${domain}`;
      const result = await prisma.user.updateMany({ where: { email: from }, data: { email: to } });
      if (result.count) {
        console.log(`${from} → ${to}`);
        moved += result.count;
      }
      await prisma.editorialBoardMember.updateMany({ where: { email: from }, data: { email: to } });
    }
    if (!moved) console.log(`No legacy row for ${to}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
