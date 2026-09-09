import Link from "next/link";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { displayName } from "@/lib/services/authors";
import { AuthorProfileForm } from "@/components/admin/AuthorProfileForm";

export default async function AuthorProfileAdminPage() {
  const user = await requireSession();
  if (user.role !== Role.AUTHOR && user.role !== Role.SUPER_ADMIN) redirect("/admin");
  const author = await prisma.author.findFirst({
    where: { userId: user.id, deletedAt: null },
    include: {
      articles: {
        where: { article: { status: "PUBLISHED", deletedAt: null } },
        include: { article: { include: { journal: true } } },
        orderBy: { authorOrder: "asc" },
      },
    },
  });
  return (
    <div>
      <h1 className="font-serif text-3xl">Author profile</h1>
      <p className="mt-2 text-ink-600">Keep your name, affiliation, and ORCID current.</p>
      <AuthorProfileForm author={author} />
      {author?.orcid ? (
        <p className="mt-4 text-sm">
          ORCID:{" "}
          <a className="underline" href={`https://orcid.org/${author.orcid}`}>
            https://orcid.org/{author.orcid}
          </a>
        </p>
      ) : null}
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Published articles</h2>
        <ul className="mt-4 divide-y rounded border bg-white">
          {author?.articles.map((link) => (
            <li key={link.articleId} className="p-4">
              <Link
                className="font-serif text-lg underline"
                href={`/journals/${link.article.journal.websiteSlug}/articles/${link.article.slug}`}
              >
                {link.article.title}
              </Link>
              <p className="text-sm text-ink-600">{link.article.journal.name}</p>
            </li>
          ))}
          {!author?.articles.length ? <li className="p-4 text-ink-600">No published articles yet.</li> : null}
        </ul>
      </section>
      {author ? (
        <p className="mt-6 text-sm text-ink-500">Public profile shows as {displayName(author)}.</p>
      ) : null}
    </div>
  );
}
