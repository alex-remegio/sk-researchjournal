import { isValidDoi } from "@/lib/identifiers";
import { pipelineStage } from "@/lib/lifecycle/article";

/**
 * Product publishing pipeline.
 *
 * RESEARCHER → EDAS (Submission → Review → Decision) → ACCEPTED
 *   → JOURNAL ADMIN PORTAL → Metadata | PDF | DOI → PUBLICATION
 *   → PUBLIC ARTICLE PAGE → Scholar | Crossref | ORCID
 *   → Google Scholar (from Scholar tags)
 */
export const EDAS_STAGES = ["submission", "review", "decision"] as const;
export type EdasPipelineStage = (typeof EDAS_STAGES)[number];

export type ProductionAssets = {
  metadata: boolean;
  pdf: boolean;
  doi: boolean;
};

export type DiscoveryChannels = {
  scholar: boolean;
  crossref: boolean;
  orcid: boolean;
};

export type PublishingPhase =
  | "researcher"
  | "edas"
  | "accepted"
  | "admin"
  | "publication"
  | "public";

export type PublishingProgress = {
  phase: PublishingPhase;
  edasStage: EdasPipelineStage | null;
  accepted: boolean;
  assets: ProductionAssets;
  published: boolean;
  discovery: DiscoveryChannels;
};

export type PublishingSnapshot = {
  status?: string | null;
  edasStage?: string | null;
  title?: string | null;
  abstract?: string | null;
  journalId?: string | null;
  issueId?: string | null;
  publicationDate?: Date | string | null;
  authors?: { corresponding?: boolean; orcid?: string | null; author?: { orcid?: string | null } }[];
  keywords?: unknown[];
  hasFinalPdf?: boolean;
  doi?: string | null;
};

export function hasMetadata(article: PublishingSnapshot) {
  const authors = article.authors ?? [];
  const corresponding = authors.filter((author) => author.corresponding).length;
  return Boolean(
    article.title?.trim() &&
      article.abstract?.trim() &&
      article.journalId &&
      article.issueId &&
      article.publicationDate &&
      authors.length >= 1 &&
      corresponding === 1 &&
      (article.keywords?.length ?? 0) >= 1,
  );
}

export function hasPdf(article: PublishingSnapshot) {
  return Boolean(article.hasFinalPdf);
}

export function hasDoi(article: PublishingSnapshot) {
  return Boolean(article.doi && isValidDoi(article.doi));
}

export function productionAssets(article: PublishingSnapshot): ProductionAssets {
  return {
    metadata: hasMetadata(article),
    pdf: hasPdf(article),
    doi: hasDoi(article),
  };
}

export function productionComplete(assets: ProductionAssets) {
  return assets.metadata && assets.pdf && assets.doi;
}

export function hasOrcid(article: PublishingSnapshot) {
  return (article.authors ?? []).some((link) => Boolean(link.orcid || link.author?.orcid));
}

export function edasStageFromStatus(status?: string | null, recorded?: string | null): EdasPipelineStage | null {
  if (recorded === "submission" || recorded === "review" || recorded === "decision") return recorded;
  const stage = pipelineStage(status ?? "DRAFT");
  if (status === "SUBMITTED") return "submission";
  if (stage === "FOR_REVIEW") return "review";
  if (stage === "READY_FOR_PUBLICATION" || stage === "SCHEDULED" || stage === "PUBLISHED" || status === "REJECTED") {
    return "decision";
  }
  return null;
}

export function publishingProgress(article: PublishingSnapshot): PublishingProgress {
  const status = article.status ?? "DRAFT";
  const stage = pipelineStage(status);
  const assets = productionAssets(article);
  const published = stage === "PUBLISHED";
  const accepted =
    stage === "READY_FOR_PUBLICATION" || stage === "SCHEDULED" || stage === "PUBLISHED";
  const edasStage = edasStageFromStatus(status, article.edasStage);

  let phase: PublishingPhase = "researcher";
  if (published) phase = "public";
  else if (stage === "SCHEDULED") phase = "publication";
  else if (accepted && productionComplete(assets)) phase = "publication";
  else if (accepted) phase = "admin";
  else if (edasStage) phase = "edas";

  return {
    phase,
    edasStage,
    accepted,
    assets,
    published,
    discovery: {
      scholar: published,
      crossref: published && assets.doi,
      orcid: hasOrcid(article),
    },
  };
}
