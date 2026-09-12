import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import { getCurrentIssue } from "@/lib/services/issues";
import { displayName } from "@/lib/services/authors";
import { IssueCover } from "@/components/public/IssueCover";

export default async function JournalHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
    include: {
      announcements: { where: { active: true, deletedAt: null }, take: 3, orderBy: { createdAt: "desc" } },
      categories: { where: { deletedAt: null }, orderBy: { name: "asc" } },
    },
  });
  if (!journal) notFound();
  const current = await getCurrentIssue(journal.id);

  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <h1 className="font-serif text-4xl">{journal.name}</h1>
      <p className="mt-2 text-ink-600">
        {journal.publisher} · {journal.frequency}
        {journal.issnOnline ? ` · eISSN ${journal.issnOnline}` : ""}
        {journal.issnPrint ? ` · ISSN ${journal.issnPrint}` : ""}
      </p>
      <p className="mt-6 max-w-3xl text-ink-800">{journal.description.replace(/<[^>]+>/g, "")}</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link className="underline" href={`/journals/${slug}/current`}>
          Current issue
        </Link>
        <Link className="underline" href={`/journals/${slug}/archive`}>
          Archive
        </Link>
        <Link className="underline" href={`/journals/${slug}/about`}>
          About
        </Link>
        <Link className="underline" href={`/journals/${slug}/for-authors`}>
          For authors
        </Link>
        <Link className="underline" href={`/journals/${slug}/for-reviewers`}>
          For reviewers
        </Link>
        <Link className="underline" href={`/journals/${slug}/editorial-workflow`}>
          Editorial workflow
        </Link>
        <Link className="underline" href="/docs/SKRJET_Role-Based_Guide.pdf">
          Role guide (PDF)
        </Link>
      </div>

      {current ? (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Current issue</h2>
          <div className="mt-4 flex flex-wrap gap-6">
            <IssueCover src={current.coverUrl} title={current.title} />
            <div>
              <p className="text-ink-600">
                Vol. {current.volume}, No. {current.issueNumber} ({current.year}) — {current.title}
              </p>
              <ul className="mt-4 divide-y divide-ink-200 bg-white">
                {current.articles.map((article) => (
                  <li key={article.id} className="p-4">
                    <Link
                      className="font-serif text-lg hover:underline"
                      href={`/journals/${slug}/articles/${article.slug}`}
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-ink-600">
                      {article.authors.map((link) => displayName(link.author)).join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {journal.categories.length ? (
        <section id="categories" className="mt-12">
          <h2 className="font-serif text-2xl">Categories</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {journal.categories.map((category) => (
              <li key={category.id}>
                <Link className="rounded bg-white px-3 py-1 text-sm underline" href={`/journals/${slug}/categories/${category.slug}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {journal.announcements.length ? (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Announcements</h2>
          <ul className="mt-4 space-y-3">
            {journal.announcements.map((item) => (
              <li key={item.id}>
                <Link className="font-medium underline" href={`/journals/${slug}/announcements`}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PublicShell>
  );
}
