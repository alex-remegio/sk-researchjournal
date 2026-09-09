import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { createAuthor } from "@/lib/services/authors";
import { replaceArticleAuthors } from "@/lib/services/articles";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const payloadSchema = z.object({
  authors: z.array(
    z.object({
      authorId: z.string().optional(),
      author: z.any().optional(),
      authorOrder: z.number().int().positive(),
      corresponding: z.boolean().default(false),
      affiliationText: z.string().nullable().optional(),
    }),
  ),
});

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const { authors } = payloadSchema.parse(await request.json());
    const links = [];
    for (const item of authors) {
      let authorId = item.authorId;
      if (!authorId && item.author) {
        const created = await createAuthor(item.author, user, meta);
        authorId = created.id;
      }
      if (!authorId) continue;
      links.push({
        authorId,
        authorOrder: item.authorOrder,
        corresponding: item.corresponding,
        affiliationText: item.affiliationText,
      });
    }
    const article = await replaceArticleAuthors(id, links, user, meta);
    return json({ article });
  });
}
