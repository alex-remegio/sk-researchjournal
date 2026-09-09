import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { getIssueById, updateIssue } from "@/lib/services/issues";
import { assertPermission, canApproveIssue, canManageIssues } from "@/lib/auth/rbac";
import { issueSchema } from "@/lib/validation/schemas";
import { AuditAction, IssueStatus } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async () => json({ issue: await getIssueById(id) }), { csrf: false });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const existing = await getIssueById(id);
    const input = issueSchema.partial().parse(await request.json());
    if (input.status === IssueStatus.PUBLISHED) {
      assertPermission(canApproveIssue(user, existing.journalId), "Only Editor-in-Chief can approve issues");
      await writeAuditLog({
        userId: user.id,
        action: AuditAction.APPROVE,
        entityType: "Issue",
        entityId: id,
        ...meta,
      });
    } else {
      assertPermission(canManageIssues(user, existing.journalId));
    }
    const issue = await updateIssue(id, input, user, meta);
    return json({ issue });
  });
}
