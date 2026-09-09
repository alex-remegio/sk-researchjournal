import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { prisma } from "@/lib/db";
import { announcementSchema } from "@/lib/validation/schemas";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";
import { assertPermission, canManageJournal } from "@/lib/auth/rbac";
import { writeAuditLog } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

export async function GET(request: NextRequest) {
  const journalId = request.nextUrl.searchParams.get("journalId") ?? undefined;
  return withAuth(
    request,
    async () =>
      json({
        announcements: await prisma.announcement.findMany({
          where: { deletedAt: null, ...(journalId ? { journalId } : {}) },
          include: { journal: true },
          orderBy: { createdAt: "desc" },
        }),
      }),
    { csrf: false },
  );
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    const input = announcementSchema.parse(await request.json());
    assertPermission(canManageJournal(user, input.journalId));
    const announcement = await prisma.announcement.create({
      data: {
        ...input,
        title: sanitizePlainText(input.title),
        body: sanitizeRichText(input.body),
        createdById: user.id,
      },
    });
    await writeAuditLog({
      userId: user.id,
      action: AuditAction.CREATE,
      entityType: "Announcement",
      entityId: announcement.id,
      ...meta,
    });
    return json({ announcement }, 201);
  });
}
