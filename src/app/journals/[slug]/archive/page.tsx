import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import { IssueCover } from "@/components/public/IssueCover";

export default async function ArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
    include: {
      issues: {
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: [{ year: "desc" }, { volume: "desc" }, { issueNumber: "desc" }],
      },
    },
  });
  if (!journal) notFound();
  const byYear = new Map<number, typeof journal.issues>();
  for (const issue of journal.issues) {
    const list = byYear.get(issue.year) ?? [];
    list.push(issue);
    byYear.set(issue.year, list);
  }
  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <h1 className="font-serif text-4xl">Issue archive</h1>
      {[...byYear.entries()].map(([year, issues]) => (
        <section key={year} className="mt-8">
          <h2 className="font-serif text-2xl">{year}</h2>
          <ul className="mt-3 space-y-2">
            {issues.map((issue) => (
              <li key={issue.id} className="flex items-center gap-3">
                <IssueCover src={issue.coverUrl} title={issue.title} className="h-16 w-12 object-cover" />
                <Link className="underline" href={`/journals/${slug}/issues/${issue.id}`}>
                  Volume {issue.volume}, Issue {issue.issueNumber}: {issue.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PublicShell>
  );
}
