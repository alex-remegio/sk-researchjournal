import { prisma } from "@/lib/db";
import { displayName } from "@/lib/services/authors";

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    where: { deletedAt: null },
    orderBy: [{ lastName: "asc" }],
  });
  return (
    <div>
      <h1 className="font-serif text-3xl">Authors</h1>
      <ul className="mt-6 divide-y rounded border bg-white">
        {authors.map((author) => (
          <li key={author.id} className="p-4">
            <p className="font-medium">{displayName(author)}</p>
            <p className="text-sm text-ink-600">
              {author.affiliation} · {author.email}
              {author.orcid ? ` · ${author.orcid}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
