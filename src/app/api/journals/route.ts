import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { listJournals, createJournal } from "@/lib/services/journals";
import { canManagePlatform } from "@/lib/auth/rbac";
import { assertPermission } from "@/lib/auth/rbac";
import { journalSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    const journals = await listJournals();
    return json({ journals });
  }, { csrf: false });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    assertPermission(canManagePlatform(user), "Only Super Admin can create journals");
    const journal = await createJournal(journalSchema.parse(await request.json()), user, meta);
    return json({ journal }, 201);
  });
}
