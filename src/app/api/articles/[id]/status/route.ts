import { NextRequest } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { transitionArticle } from "@/lib/services/articles";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const { status } = z
      .object({
        status: z.enum([
          "DRAFT",
          "SUBMITTED",
          "FOR_REVIEW",
          "REVISION_REQUIRED",
          "REVISED",
          "FOR_APPROVAL",
          "APPROVED",
          "READY_FOR_PUBLICATION",
          "SCHEDULED",
          "PUBLISHED",
          "REJECTED",
          "ARCHIVED",
        ]),
      })
      .parse(await request.json());
    const article = await transitionArticle(id, status as ArticleStatus, user, meta);
    return json({ article });
  });
}
