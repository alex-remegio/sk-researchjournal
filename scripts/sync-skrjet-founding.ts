/**
 * Sync SKRJET founding document content into the live database.
 * Usage: DATABASE_URL="..." npx tsx scripts/sync-skrjet-founding.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  SKRJET_DESCRIPTION_HTML,
  SKRJET_FOUNDING_BOARD,
} from "../src/lib/content/skrjet";

const prisma = new PrismaClient();

async function main() {
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: "skrjet", deletedAt: null },
  });
  if (!journal) {
    throw new Error('Journal with websiteSlug "skrjet" not found.');
  }

  await prisma.journal.update({
    where: { id: journal.id },
    data: {
      name: "Sultan Kudarat Research Journal of Education and Technology",
      abbreviation: "SKRJET",
      description: SKRJET_DESCRIPTION_HTML,
      publisher: "Sultan Kudarat State University",
      frequency: "Bi-annual (June and December)",
    },
  });

  await prisma.user.updateMany({
    where: { email: "eic@sksu.edu.ph" },
    data: { name: "Mildred F. Accad, PhD", role: "EDITOR_IN_CHIEF" },
  });
  await prisma.user.updateMany({
    where: { email: "managing@sksu.edu.ph" },
    data: { name: "Cyril John A. Domingo, PhD", role: "MANAGING_EDITOR" },
  });
  await prisma.user.updateMany({
    where: { email: "superadmin@sksu.edu.ph" },
    data: { name: "Alex Remegio, PhD", role: "SUPER_ADMIN" },
  });

  const eic = await prisma.user.findFirst({ where: { email: "eic@sksu.edu.ph" } });
  const managing = await prisma.user.findFirst({ where: { email: "managing@sksu.edu.ph" } });
  const superAdmin = await prisma.user.findFirst({ where: { email: "superadmin@sksu.edu.ph" } });

  await prisma.editorialBoardMember.deleteMany({ where: { journalId: journal.id } });
  await prisma.editorialBoardMember.createMany({
    data: SKRJET_FOUNDING_BOARD.map((member) => ({
      journalId: journal.id,
      userId:
        member.title === "Editor-in-Chief"
          ? eic?.id ?? null
          : member.title === "Managing Editor"
            ? managing?.id ?? null
            : member.title === "Super Admin"
              ? superAdmin?.id ?? null
              : null,
      name: member.name,
      title: member.title,
      affiliation: member.affiliation,
      email: member.email ?? null,
      biography: member.biography ?? null,
      sortOrder: member.sortOrder,
    })),
  });

  console.log(`Synced SKRJET founding content for journal ${journal.id}`);
  console.log(`Board members: ${SKRJET_FOUNDING_BOARD.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
