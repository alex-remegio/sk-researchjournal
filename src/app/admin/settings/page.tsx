import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { canManageJournal, canManagePlatform } from "@/lib/auth/rbac";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getJournalSettings } from "@/lib/services/settings";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const user = await requireSession();
  const journals = await prisma.journal.findMany({ where: { deletedAt: null } });
  const journal = journals.find((item) => canManageJournal(user, item.id)) ?? (canManagePlatform(user) ? journals[0] : null);
  if (!journal) redirect("/admin");
  const settings = await getJournalSettings(journal.id);
  return (
    <div>
      <h1 className="font-serif text-3xl">
        {canManagePlatform(user) ? "System configuration" : "Journal settings"}
      </h1>
      <SettingsForm journal={journal} settings={settings.raw} />
    </div>
  );
}
