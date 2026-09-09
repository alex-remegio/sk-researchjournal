import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import { displayName } from "@/lib/services/authors";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}) {
  const { slug, categorySlug } = await params;
  const category = await prisma.category.findFirst({
    where: {
      slug: categorySlug,
      deletedAt: null,
      journal: { websiteSlug: slug, deletedAt: null, active: true },
    },
    include: {
      journal: true,
      articles: {
        where: { deletedAt: null, status: "PUBLISHED" },
        include: { authors: { include: { author: true }, orderBy: { authorOrder: "asc" } } },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
  if (!category) notFound();
  return (
    <PublicShell>
      <JournalNav slug={slug} name={category.journal.name} />
      <h1 className="font-serif text-4xl">{category.name}</h1>
      {category.description ? <p className="mt-3 max-w-3xl">{category.description}</p> : null}
      <ul className="mt-8 divide-y divide-ink-200 bg-white">
        {category.articles.map((article) => (
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
    </PublicShell>
  );
}
