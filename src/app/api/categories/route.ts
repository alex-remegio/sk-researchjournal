import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { prisma } from "@/lib/db";
import { categorySchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/slug";
import { sanitizePlainText } from "@/lib/sanitize";
import { assertPermission, canManageJournal, canCreateArticle } from "@/lib/auth/rbac";
import { writeAuditLog } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

export async function GET(request: NextRequest) {
  const journalId = request.nextUrl.searchParams.get("journalId") ?? undefined;
  return withAuth(
    request,
    async () =>
      json({
        categories: await prisma.category.findMany({
          where: { deletedAt: null, ...(journalId ? { journalId } : {}) },
          orderBy: { name: "asc" },
        }),
      }),
    { csrf: false },
  );
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    const input = categorySchema.parse(await request.json());
    assertPermission(
      canManageJournal(user, input.journalId) || canCreateArticle(user, input.journalId),
    );
    const category = await prisma.category.create({
      data: {
        journalId: input.journalId,
        name: sanitizePlainText(input.name),
        slug: input.slug || slugify(input.name),
        description: input.description,
        parentId: input.parentId ?? null,
      },
    });
    await writeAuditLog({
      userId: user.id,
      action: AuditAction.CREATE,
      entityType: "Category",
      entityId: category.id,
      ...meta,
    });
    return json({ category }, 201);
  });
}
