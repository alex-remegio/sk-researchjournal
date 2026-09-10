import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
    include: {
      editorialBoard: { where: { deletedAt: null, active: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!journal) notFound();
  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <h1 className="font-serif text-4xl">
        {slug === "skrjet" ? "Founding editorial board" : "Editorial board"}
      </h1>
      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {journal.editorialBoard.map((member) => (
          <li key={member.id} className="border border-ink-200 bg-white p-5">
            <h2 className="font-serif text-xl">{member.name}</h2>
            <p className="text-sm text-crimson-700">{member.title}</p>
            {member.affiliation ? <p className="mt-1 text-sm text-ink-600">{member.affiliation}</p> : null}
            {member.email ? (
              <p className="mt-1 text-sm text-ink-600">
                <a className="underline" href={`mailto:${member.email}`}>
                  {member.email}
                </a>
              </p>
            ) : null}
            {member.biography ? <p className="mt-3 text-sm">{member.biography.replace(/<[^>]+>/g, "")}</p> : null}
          </li>
        ))}
      </ul>
    </PublicShell>
  );
}
