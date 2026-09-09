import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { prisma } from "@/lib/db";
import { assertPermission, canViewAuditLogs, isSuperAdmin } from "@/lib/auth/rbac";

export async function GET(request: NextRequest) {
  const journalId = request.nextUrl.searchParams.get("journalId") ?? undefined;
  return withAuth(
    request,
    async ({ user }) => {
      assertPermission(canViewAuditLogs(user, journalId));
      const logs = await prisma.auditLog.findMany({
        where: isSuperAdmin(user)
          ? undefined
          : { metadata: { path: ["journalId"], equals: journalId } },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      return json({ logs });
    },
    { csrf: false },
  );
}
