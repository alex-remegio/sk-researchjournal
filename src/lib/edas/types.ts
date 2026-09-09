/**
 * EDAS integration adapter.
 *
 * The application API talks to three backends:
 *   PostgreSQL — journal metadata, articles, issues, authors
 *   File storage — PDFs and images
 *   EDAS — submission, review, and decision records for a paper ID
 *
 * In-app single-blind review is the working editorial process. When an article
 * has an EDAS Paper ID, each of those stages is also recorded through this
 * adapter. Live HTTP calls are made only when official credentials and a
 * documented vendor endpoint are configured.
 *
 *   EDAS_MODE=live
 *   EDAS_BASE_URL=<official documented base URL>
 *   EDAS_API_KEY=<issued credential>
 *   EDAS_API_SECRET=<issued credential>
 *
 * Until then:
 *   EDAS_MODE=mock    development store
 *   EDAS_MODE=manual  editors type the EDAS Paper ID onto the article record
 */

export type EdasMode = "mock" | "manual" | "live";

export type EdasWorkflowStage = "submission" | "review" | "decision";

export type EdasPaperSummary = {
  paperId: string;
  title?: string;
  status?: string;
  source: EdasMode;
  stage?: EdasWorkflowStage;
  submission?: { recordedAt: string; title?: string; articleId?: string };
  review?: { recordedAt: string; recommendation?: string };
  decision?: { recordedAt: string; outcome?: string };
};

export type EdasSubmissionInput = {
  paperId: string;
  articleId: string;
  title: string;
};

export type EdasReviewInput = {
  paperId: string;
  recommendation: string;
};

export type EdasDecisionInput = {
  paperId: string;
  outcome: string;
};

export interface EdasService {
  mode: EdasMode;
  normalizePaperId(value: string): string;
  lookupPaper(paperId: string): Promise<EdasPaperSummary | null>;
  recordSubmission(input: EdasSubmissionInput): Promise<EdasPaperSummary>;
  recordReview(input: EdasReviewInput): Promise<EdasPaperSummary>;
  recordDecision(input: EdasDecisionInput): Promise<EdasPaperSummary>;
  syncReviewStatus(paperId: string): Promise<EdasPaperSummary | null>;
}

export function normalizeEdasPaperId(value: string) {
  return value.trim().replace(/\s+/g, "");
}
