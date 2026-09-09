import { NextRequest } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { createDraft, listArticles } from "@/lib/services/articles";
import { articleListFilter, assertPermission, canCreateArticle } from "@/lib/auth/rbac";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const journalId = request.nextUrl.searchParams.get("journalId") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") as ArticleStatus | null;
  const issueId = request.nextUrl.searchParams.get("issueId") ?? undefined;
  return withAuth(
    request,
    async ({ user }) =>
      json({
        articles: await listArticles({
          journalId,
          status: status ?? undefined,
          issueId,
          scope: articleListFilter(user),
        }),
      }),
    { csrf: false },
  );
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    const { journalId } = z.object({ journalId: z.string().min(1) }).parse(await request.json());
    assertPermission(canCreateArticle(user, journalId));
    const article = await createDraft(journalId, user, meta);
    return json({ article }, 201);
  });
}
