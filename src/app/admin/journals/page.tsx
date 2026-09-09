import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { canManageJournal, canManagePlatform } from "@/lib/auth/rbac";
import { JournalAdminForm } from "@/components/admin/JournalAdminForm";
import { redirect } from "next/navigation";

export default async function AdminJournalsPage() {
  const user = await requireSession();
  const journals = await prisma.journal.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
  const visible = canManagePlatform(user)
    ? journals
    : journals.filter((journal) => canManageJournal(user, journal.id));
  if (!visible.length && !canManagePlatform(user)) redirect("/admin");
  return (
    <div>
      <h1 className="font-serif text-3xl">Journals</h1>
      <p className="mt-2 text-ink-600">
        {canManagePlatform(user)
          ? "Super Admin creates and configures every journal on the platform."
          : "Editor-in-Chief manages the assigned journal."}
      </p>
      <ul className="mt-6 space-y-3">
        {visible.map((journal) => (
          <li key={journal.id} className="rounded border bg-white p-4">
            <p className="font-serif text-xl">
              <Link className="underline" href={`/admin/journals/${journal.id}`}>
                {journal.name}
              </Link>
            </p>
            <p className="text-sm text-ink-600">{journal.websiteSlug} · {journal.active ? "Active" : "Inactive"}</p>
          </li>
        ))}
      </ul>
      {canManagePlatform(user) ? <JournalAdminForm /> : null}
    </div>
  );
}
