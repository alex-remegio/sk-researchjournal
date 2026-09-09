import { prisma } from "@/lib/db";
import { SimpleCreateForm } from "@/components/admin/SimpleCreateForm";

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { deletedAt: null },
    include: { journal: true },
    orderBy: { createdAt: "desc" },
  });
  const journals = await prisma.journal.findMany({ where: { deletedAt: null } });
  return (
    <div>
      <h1 className="font-serif text-3xl">Announcements</h1>
      <ul className="mt-6 divide-y rounded border bg-white">
        {announcements.map((item) => (
          <li key={item.id} className="p-4">
            {item.journal.abbreviation}: {item.title}
          </li>
        ))}
      </ul>
      <SimpleCreateForm
        endpoint="/api/announcements"
        fields={[
          { name: "journalId", label: "Journal ID", placeholder: journals[0]?.id ?? "" },
          { name: "title", label: "Title" },
          { name: "body", label: "Body" },
        ]}
      />
    </div>
  );
}
