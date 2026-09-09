import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { createAuthor, listAuthors } from "@/lib/services/authors";
import { assertPermission, canManageAuthors } from "@/lib/auth/rbac";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ConflictError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  return withAuth(request, async () => json({ authors: await listAuthors(q) }), { csrf: false });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (user.role === Role.AUTHOR && !canManageAuthors(user)) {
      const existing = await prisma.author.findFirst({ where: { userId: user.id, deletedAt: null } });
      if (existing) throw new ConflictError("Your author profile already exists");
      body.userId = user.id;
      body.email = body.email ?? user.email;
    } else {
      assertPermission(canManageAuthors(user));
    }
    const author = await createAuthor(body, user, meta);
    return json({ author }, 201);
  });
}
