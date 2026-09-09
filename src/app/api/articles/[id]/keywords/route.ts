import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { replaceKeywords } from "@/lib/services/articles";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const { keywords } = z.object({ keywords: z.array(z.string().min(1).max(80)) }).parse(await request.json());
    const article = await replaceKeywords(id, keywords, user, meta);
    return json({ article });
  });
}
