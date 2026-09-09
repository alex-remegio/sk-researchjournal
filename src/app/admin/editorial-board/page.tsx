import { prisma } from "@/lib/db";
import { SimpleCreateForm } from "@/components/admin/SimpleCreateForm";

export default async function AdminBoardPage() {
  const members = await prisma.editorialBoardMember.findMany({
    where: { deletedAt: null },
    include: { journal: true },
    orderBy: { sortOrder: "asc" },
  });
  const journals = await prisma.journal.findMany({ where: { deletedAt: null } });
  return (
    <div>
      <h1 className="font-serif text-3xl">Editorial board</h1>
      <ul className="mt-6 divide-y rounded border bg-white">
        {members.map((member) => (
          <li key={member.id} className="p-4">
            {member.name} — {member.title} ({member.journal.abbreviation})
          </li>
        ))}
      </ul>
      <SimpleCreateForm
        endpoint="/api/editorial-board"
        fields={[
          { name: "journalId", label: "Journal ID", placeholder: journals[0]?.id ?? "" },
          { name: "name", label: "Name" },
          { name: "title", label: "Title" },
          { name: "affiliation", label: "Affiliation" },
        ]}
      />
    </div>
  );
}
