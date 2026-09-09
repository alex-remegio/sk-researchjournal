import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { prisma } from "@/lib/db";
import { editorialBoardSchema } from "@/lib/validation/schemas";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";
import { assertPermission, canManageEditorialBoard } from "@/lib/auth/rbac";
import { writeAuditLog } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

export async function GET(request: NextRequest) {
  const journalId = request.nextUrl.searchParams.get("journalId") ?? undefined;
  return withAuth(
    request,
    async () =>
      json({
        members: await prisma.editorialBoardMember.findMany({
          where: { deletedAt: null, ...(journalId ? { journalId } : {}) },
          orderBy: { sortOrder: "asc" },
        }),
      }),
    { csrf: false },
  );
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    const input = editorialBoardSchema.parse(await request.json());
    assertPermission(canManageEditorialBoard(user, input.journalId));
    const member = await prisma.editorialBoardMember.create({
      data: {
        ...input,
        name: sanitizePlainText(input.name),
        title: sanitizePlainText(input.title),
        affiliation: sanitizePlainText(input.affiliation),
        biography: input.biography ? sanitizeRichText(input.biography) : null,
      },
    });
    await writeAuditLog({
      userId: user.id,
      action: AuditAction.CREATE,
      entityType: "EditorialBoardMember",
      entityId: member.id,
      ...meta,
    });
    return json({ member }, 201);
  });
}
