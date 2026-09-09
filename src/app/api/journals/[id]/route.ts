import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { getJournalById, updateJournal } from "@/lib/services/journals";
import { assertPermission, canManageJournal } from "@/lib/auth/rbac";
import { journalSchema } from "@/lib/validation/schemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async () => json({ journal: await getJournalById(id) }), { csrf: false });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    assertPermission(canManageJournal(user, id));
    const journal = await updateJournal(id, journalSchema.partial().parse(await request.json()), user, meta);
    return json({ journal });
  });
}
