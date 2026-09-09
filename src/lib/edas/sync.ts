import { getEdasService } from "@/lib/edas";
import type { EdasPaperSummary } from "@/lib/edas/types";

type ArticleEdasRef = {
  id: string;
  title: string;
  edasPaperId?: string | null;
};

async function withPaper<T>(
  article: ArticleEdasRef,
  run: (paperId: string) => Promise<T>,
): Promise<T | null> {
  const paperId = article.edasPaperId?.trim();
  if (!paperId) return null;
  try {
    return await run(paperId);
  } catch {
    return null;
  }
}

export async function recordEdasSubmission(article: ArticleEdasRef): Promise<EdasPaperSummary | null> {
  return withPaper(article, (paperId) =>
    getEdasService().recordSubmission({
      paperId,
      articleId: article.id,
      title: article.title,
    }),
  );
}

export async function recordEdasReview(
  article: ArticleEdasRef,
  recommendation: string,
): Promise<EdasPaperSummary | null> {
  return withPaper(article, (paperId) => getEdasService().recordReview({ paperId, recommendation }));
}

export async function recordEdasDecision(
  article: ArticleEdasRef,
  outcome: string,
): Promise<EdasPaperSummary | null> {
  return withPaper(article, (paperId) => getEdasService().recordDecision({ paperId, outcome }));
}

export async function lookupEdasPaper(paperId?: string | null): Promise<EdasPaperSummary | null> {
  if (!paperId?.trim()) return null;
  try {
    return await getEdasService().lookupPaper(paperId);
  } catch {
    return null;
  }
}
