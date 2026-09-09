import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";

export default async function AboutJournal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
  });
  if (!journal) notFound();
  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <h1 className="font-serif text-4xl">About {journal.name}</h1>
      <div className="prose-article mt-6 max-w-3xl leading-7" dangerouslySetInnerHTML={{ __html: journal.description }} />
      <dl className="mt-8 grid max-w-xl gap-2 text-sm">
        <div>
          <dt className="font-medium">Publisher</dt>
          <dd>{journal.publisher}</dd>
        </div>
        <div>
          <dt className="font-medium">Frequency</dt>
          <dd>{journal.frequency}</dd>
        </div>
        {journal.issnPrint ? (
          <div>
            <dt className="font-medium">ISSN (print)</dt>
            <dd>{journal.issnPrint}</dd>
          </div>
        ) : null}
        {journal.issnOnline ? (
          <div>
            <dt className="font-medium">ISSN (online)</dt>
            <dd>{journal.issnOnline}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium">Peer review</dt>
          <dd>
            Single-blind. See the{" "}
            <a className="underline" href={`/journals/${slug}/peer-review`}>
              peer review process
            </a>
            .
          </dd>
        </div>
      </dl>
    </PublicShell>
  );
}
