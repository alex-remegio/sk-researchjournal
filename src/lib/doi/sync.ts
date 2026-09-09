import { getCrossrefService } from "@/lib/doi";
import type { CrossrefDepositResult } from "@/lib/doi/types";
import { articleAbsoluteUrl } from "@/lib/scholar";

type CrossrefArticle = {
  id: string;
  doi?: string | null;
  title: string;
  abstract?: string | null;
  slug: string;
  firstPage?: string | null;
  lastPage?: string | null;
  publicationDate?: Date | null;
  journal: {
    name: string;
    websiteSlug: string;
    issnPrint?: string | null;
    issnOnline?: string | null;
  };
  issue?: {
    volume?: string | number | null;
    issueNumber?: string | number | null;
  } | null;
  authors: {
    author: { firstName: string; lastName: string; orcid?: string | null };
  }[];
};

export async function registerCrossrefDeposit(
  article: CrossrefArticle,
): Promise<CrossrefDepositResult | null> {
  const doi = article.doi?.trim();
  if (!doi) return null;
  try {
    return await getCrossrefService().registerArticle({
      doi,
      articleId: article.id,
      title: article.title,
      abstract: article.abstract ?? undefined,
      resourceUrl: articleAbsoluteUrl(article.journal.websiteSlug, article.slug),
      publicationDate: article.publicationDate,
      firstPage: article.firstPage,
      lastPage: article.lastPage,
      journalTitle: article.journal.name,
      issnPrint: article.journal.issnPrint,
      issnOnline: article.journal.issnOnline,
      volume: article.issue?.volume,
      issueNumber: article.issue?.issueNumber,
      authors: article.authors.map((link) => ({
        given: link.author.firstName,
        family: link.author.lastName,
        orcid: link.author.orcid,
      })),
    });
  } catch {
    return null;
  }
}
