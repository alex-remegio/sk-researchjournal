import Link from "next/link";
import { PublicShell } from "@/components/public/Shell";
import { getAuthorById, displayName } from "@/lib/services/authors";
import { notFound } from "next/navigation";

export default async function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let author;
  try {
    author = await getAuthorById(id);
  } catch {
    notFound();
  }
  return (
    <PublicShell>
      <h1 className="font-serif text-4xl">{displayName(author)}</h1>
      <p className="mt-2 text-ink-700">{author.affiliation}</p>
      <p className="text-sm text-ink-600">{author.country}</p>
      {author.orcid ? (
        <p className="mt-2 text-sm">
          ORCID:{" "}
          <a href={`https://orcid.org/${author.orcid}`}>https://orcid.org/{author.orcid}</a>
        </p>
      ) : null}
      {author.biography ? (
        <div className="prose-article mt-6 max-w-3xl" dangerouslySetInnerHTML={{ __html: author.biography }} />
      ) : null}
      {author.affiliations.length ? (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Affiliations</h2>
          <ul className="mt-2 list-disc pl-5">
            {author.affiliations.map((item) => (
              <li key={item.id}>
                {item.name}
                {item.department ? ` — ${item.department}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Published articles</h2>
        <ul className="mt-4 divide-y divide-ink-200 bg-white">
          {author.articles.map((link) => (
            <li key={link.articleId} className="p-4">
              <Link
                className="font-serif text-lg hover:underline"
                href={`/journals/${link.article.journal.websiteSlug}/articles/${link.article.slug}`}
              >
                {link.article.title}
              </Link>
              <p className="text-sm text-ink-600">{link.article.journal.name}</p>
            </li>
          ))}
        </ul>
      </section>
    </PublicShell>
  );
}
