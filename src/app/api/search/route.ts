import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withPublic } from "@/lib/api/guard";
import { searchArticles } from "@/lib/services/search";
import { fromUrlSearchParams } from "@/lib/search/query";
import { searchQuerySchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  return withPublic(async () => {
    const parsed = searchQuerySchema.parse(fromUrlSearchParams(request.nextUrl.searchParams));
    const result = await searchArticles({
      q: parsed.q,
      keyword: parsed.keyword,
      author: parsed.author,
      title: parsed.title,
      journalSlugs: parsed.journal,
      years: parsed.year,
      volume: parsed.volume,
      issue: parsed.issue,
      categories: parsed.category,
      page: parsed.page,
    });
    return json(result);
  });
}
