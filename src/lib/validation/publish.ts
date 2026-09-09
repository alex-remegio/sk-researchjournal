import { isValidDoi, isValidPageRange } from "@/lib/identifiers";
import { isApprovedForPublication } from "@/lib/lifecycle/article";

export type PublishSnapshot = {
  title?: string | null;
  abstract?: string | null;
  journalId?: string | null;
  issueId?: string | null;
  publicationDate?: Date | null;
  authors: { corresponding: boolean }[];
  keywords: unknown[];
  hasFinalPdf: boolean;
  firstPage?: string | null;
  lastPage?: string | null;
  doi?: string | null;
  approvedAt?: Date | null;
  status?: string | null;
};

export function getPublishBlockers(article: PublishSnapshot) {
  const blockers: string[] = [];
  if (!article.title?.trim()) blockers.push("Title is required");
  if (!article.abstract?.trim()) blockers.push("Abstract is required");
  if (!article.journalId) blockers.push("Journal is required");
  if (!article.issueId) blockers.push("Issue is required");
  if (!article.publicationDate) blockers.push("Publication date is required");
  if (article.authors.length < 1) blockers.push("At least one author is required");
  const corresponding = article.authors.filter((author) => author.corresponding).length;
  if (corresponding !== 1) blockers.push("Exactly one corresponding author is required");
  if (article.keywords.length < 1) blockers.push("At least one keyword is required");
  if (!article.hasFinalPdf) blockers.push("Final PDF is required");
  if (!article.doi?.trim() || !isValidDoi(article.doi)) blockers.push("DOI is required");
  if (!isValidPageRange(article.firstPage, article.lastPage)) {
    blockers.push("Page range is invalid");
  }
  if ((article.firstPage && !article.lastPage) || (!article.firstPage && article.lastPage)) {
    blockers.push("Both first and last page must be provided together");
  }
  if (!isApprovedForPublication(article.status, article.approvedAt)) {
    blockers.push("Editor-in-Chief approval is required");
  }
  return blockers;
}

export function canTransition(from: string, to: string) {
  const allowed: Record<string, string[]> = {
    DRAFT: ["SUBMITTED", "FOR_REVIEW", "ARCHIVED"],
    SUBMITTED: ["FOR_REVIEW", "REJECTED", "DRAFT", "ARCHIVED"],
    FOR_REVIEW: ["REVISION_REQUIRED", "READY_FOR_PUBLICATION", "FOR_APPROVAL", "REJECTED", "DRAFT", "ARCHIVED"],
    REVISION_REQUIRED: ["REVISED", "DRAFT", "ARCHIVED"],
    REVISED: ["FOR_REVIEW", "READY_FOR_PUBLICATION", "FOR_APPROVAL", "REJECTED", "ARCHIVED"],
    FOR_APPROVAL: ["READY_FOR_PUBLICATION", "APPROVED", "DRAFT", "ARCHIVED"],
    APPROVED: ["READY_FOR_PUBLICATION", "SCHEDULED", "PUBLISHED", "ARCHIVED"],
    READY_FOR_PUBLICATION: ["SCHEDULED", "PUBLISHED", "DRAFT", "ARCHIVED"],
    SCHEDULED: ["PUBLISHED", "READY_FOR_PUBLICATION", "ARCHIVED"],
    PUBLISHED: ["SCHEDULED", "READY_FOR_PUBLICATION", "ARCHIVED"],
    REJECTED: ["ARCHIVED", "DRAFT"],
    ARCHIVED: ["DRAFT"],
  };
  return allowed[from]?.includes(to) ?? false;
}
