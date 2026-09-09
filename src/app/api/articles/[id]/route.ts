import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import {
  getArticleById,
  publishSnapshotFromArticle,
  updateArticleIdentifiers,
  updateArticleInformation,
  updateArticlePublication,
} from "@/lib/services/articles";
import { getPublishBlockers } from "@/lib/validation/publish";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(
    request,
    async () => {
      const article = await getArticleById(id);
      return json({
        article,
        blockers: getPublishBlockers(publishSnapshotFromArticle(article)),
      });
    },
    { csrf: false },
  );
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const body = await request.json();
    const step = body.step as string | undefined;
    let article;
    if (step === "publication") article = await updateArticlePublication(id, body, user, meta);
    else if (step === "identifiers") article = await updateArticleIdentifiers(id, body, user, meta);
    else article = await updateArticleInformation(id, body, user, meta);
    return json({
      article,
      blockers: getPublishBlockers(publishSnapshotFromArticle(article)),
    });
  });
}
