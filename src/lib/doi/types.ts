/**
 * Crossref DOI registration.
 *
 * Publication stays on this platform. Crossref is the DOI registration agency.
 * Live deposits require Crossref membership credentials. Until then:
 *
 *   CROSSREF_MODE=mock    development store
 *   CROSSREF_MODE=manual  editors type a DOI; no remote deposit
 *   CROSSREF_MODE=live    authenticated deposit when credentials are set
 */

export type CrossrefMode = "mock" | "manual" | "live";

export type CrossrefDepositInput = {
  doi: string;
  articleId: string;
  title: string;
  abstract?: string;
  resourceUrl: string;
  publicationDate?: Date | null;
  firstPage?: string | null;
  lastPage?: string | null;
  journalTitle: string;
  issnPrint?: string | null;
  issnOnline?: string | null;
  volume?: string | number | null;
  issueNumber?: string | number | null;
  authors: { given: string; family: string; orcid?: string | null }[];
};

export type CrossrefDepositResult = {
  doi: string;
  status: string;
  source: CrossrefMode;
  depositedAt: string;
  resourceUrl?: string;
};

export interface CrossrefService {
  mode: CrossrefMode;
  registerArticle(input: CrossrefDepositInput): Promise<CrossrefDepositResult>;
  lookup(doi: string): Promise<CrossrefDepositResult | null>;
}
