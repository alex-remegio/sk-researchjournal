import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { listIssues, createIssue } from "@/lib/services/issues";
import { assertPermission, canManageIssues } from "@/lib/auth/rbac";
import { issueSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  const journalId = request.nextUrl.searchParams.get("journalId") ?? undefined;
  return withAuth(request, async () => json({ issues: await listIssues(journalId) }), { csrf: false });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    const input = issueSchema.parse(await request.json());
    assertPermission(canManageIssues(user, input.journalId));
    const issue = await createIssue(input, user, meta);
    return json({ issue }, 201);
  });
}
