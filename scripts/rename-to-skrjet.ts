/**
 * One-off rename of the primary seeded journal to SKRJET.
 * Usage: DATABASE_URL="..." npx tsx scripts/rename-to-skrjet.ts
 */
import { PrismaClient } from "@prisma/client";
import { BRAND_PUBLISHER } from "../src/lib/branding";

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.journal.updateMany({
    where: { OR: [{ websiteSlug: "jacr" }, { abbreviation: "JACR" }], deletedAt: null },
    data: {
      name: "Sultan Kudarat Research Journal of Education and Technology",
      abbreviation: "SKRJET",
      websiteSlug: "skrjet",
      publisher: BRAND_PUBLISHER,
      description:
        "<p>SKRJET publishes original research in education, educational technology, and applied computing.</p>",
    },
  });
  console.log(`Updated ${updated.count} journal(s) to SKRJET (slug: /journals/skrjet).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
