import Link from "next/link";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";

export const metadata = { title: "Journals" };

export default async function JournalsPage() {
  const journals = await prisma.journal.findMany({
    where: { deletedAt: null, active: true },
    orderBy: { name: "asc" },
  });
  return (
    <PublicShell>
      <h1 className="font-serif text-4xl">Journals</h1>
      <ul className="mt-8 space-y-6">
        {journals.map((journal) => (
          <li key={journal.id} className="border-b border-ink-200 pb-6">
            <h2 className="font-serif text-2xl">
              <Link href={`/journals/${journal.websiteSlug}`}>{journal.name}</Link>
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              {journal.abbreviation}
              {journal.issnOnline ? ` · eISSN ${journal.issnOnline}` : ""}
            </p>
            <p className="mt-3 max-w-3xl text-ink-700">{journal.description.replace(/<[^>]+>/g, "")}</p>
          </li>
        ))}
      </ul>
    </PublicShell>
  );
}
