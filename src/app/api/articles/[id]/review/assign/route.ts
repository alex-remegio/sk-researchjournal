import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { assignReviewer, listPotentialReviewers } from "@/lib/services/review";
import { getArticleById } from "@/lib/services/articles";
import { canAssignReviewers } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(
    request,
    async ({ user }) => {
      const article = await getArticleById(id);
      if (!canAssignReviewers(user, article.journalId)) {
        throw new ForbiddenError("Only editors may list candidate reviewers");
      }
      return json({ reviewers: await listPotentialReviewers(article.journalId) });
    },
    { csrf: false },
  );
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const assignment = await assignReviewer(id, await request.json(), user, meta);
    return json({ assignment }, 201);
  });
}
