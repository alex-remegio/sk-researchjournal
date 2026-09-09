import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { getJournalSettings, upsertJournalSetting } from "@/lib/services/settings";
import { assertPermission, canManageJournal } from "@/lib/auth/rbac";
import { settingSchema } from "@/lib/validation/schemas";
import { writeAuditLog } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

export async function GET(request: NextRequest) {
  const journalId = request.nextUrl.searchParams.get("journalId");
  return withAuth(
    request,
    async () => {
      if (!journalId) return json({ settings: null });
      return json({ settings: await getJournalSettings(journalId) });
    },
    { csrf: false },
  );
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    const input = settingSchema.parse(await request.json());
    assertPermission(canManageJournal(user, input.journalId));
    const setting = await upsertJournalSetting(input.journalId, input.key, input.value);
    await writeAuditLog({
      userId: user.id,
      action: AuditAction.SETTINGS_UPDATE,
      entityType: "JournalSetting",
      entityId: setting.id,
      metadata: { key: input.key },
      ...meta,
    });
    return json({ setting, settings: await getJournalSettings(input.journalId) });
  });
}
