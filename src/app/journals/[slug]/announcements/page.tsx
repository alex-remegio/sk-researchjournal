import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";

export default async function AnnouncementsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
    include: {
      announcements: {
        where: { deletedAt: null, active: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
  if (!journal) notFound();
  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <h1 className="font-serif text-4xl">Announcements</h1>
      <ul className="mt-8 space-y-8">
        {journal.announcements.map((item) => (
          <li key={item.id} className="border-b border-ink-200 pb-6">
            <h2 className="font-serif text-2xl">{item.title}</h2>
            <div className="prose-article mt-3" dangerouslySetInnerHTML={{ __html: item.body }} />
          </li>
        ))}
      </ul>
    </PublicShell>
  );
}
