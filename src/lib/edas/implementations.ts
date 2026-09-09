import {
  normalizeEdasPaperId,
  type EdasDecisionInput,
  type EdasMode,
  type EdasPaperSummary,
  type EdasReviewInput,
  type EdasService,
  type EdasSubmissionInput,
} from "@/lib/edas/types";

class InMemoryEdasService implements EdasService {
  private papers = new Map<string, EdasPaperSummary>();

  constructor(public mode: Exclude<EdasMode, "live">) {}

  normalizePaperId(value: string) {
    return normalizeEdasPaperId(value);
  }

  private ensure(id: string): EdasPaperSummary {
    const existing = this.papers.get(id);
    if (existing) return existing;
    const created: EdasPaperSummary = {
      paperId: id,
      source: this.mode,
      status: this.mode === "mock" ? "accepted" : "recorded",
      title: this.mode === "mock" ? `Mock EDAS paper ${id}` : undefined,
    };
    this.papers.set(id, created);
    return created;
  }

  async lookupPaper(paperId: string): Promise<EdasPaperSummary | null> {
    const id = this.normalizePaperId(paperId);
    if (!id) return null;
    if (this.mode === "mock") return { ...this.ensure(id) };
    return this.papers.has(id) ? { ...this.papers.get(id)! } : { paperId: id, source: this.mode, status: "recorded" };
  }

  async recordSubmission(input: EdasSubmissionInput): Promise<EdasPaperSummary> {
    const id = this.normalizePaperId(input.paperId);
    const paper = this.ensure(id);
    paper.title = input.title;
    paper.stage = "submission";
    paper.status = "submitted";
    paper.submission = {
      recordedAt: new Date().toISOString(),
      title: input.title,
      articleId: input.articleId,
    };
    this.papers.set(id, paper);
    return { ...paper };
  }

  async recordReview(input: EdasReviewInput): Promise<EdasPaperSummary> {
    const id = this.normalizePaperId(input.paperId);
    const paper = this.ensure(id);
    paper.stage = "review";
    paper.status = "in_review";
    paper.review = {
      recordedAt: new Date().toISOString(),
      recommendation: input.recommendation,
    };
    this.papers.set(id, paper);
    return { ...paper };
  }

  async recordDecision(input: EdasDecisionInput): Promise<EdasPaperSummary> {
    const id = this.normalizePaperId(input.paperId);
    const paper = this.ensure(id);
    paper.stage = "decision";
    paper.status = input.outcome.toLowerCase();
    paper.decision = {
      recordedAt: new Date().toISOString(),
      outcome: input.outcome,
    };
    this.papers.set(id, paper);
    return { ...paper };
  }

  async syncReviewStatus(paperId: string) {
    return this.lookupPaper(paperId);
  }

  reset() {
    this.papers.clear();
  }
}

export class MockEdasService extends InMemoryEdasService {
  constructor() {
    super("mock");
  }
}

export class ManualEdasService extends InMemoryEdasService {
  constructor() {
    super("manual");
  }
}

/**
 * Live client scaffold. Lookups require official credentials. Workflow records
 * never invent remote HTTP calls; they return a pending vendor placeholder so
 * the local editorial process is not blocked.
 */
export class LiveEdasService implements EdasService {
  mode = "live" as const;

  constructor(
    private readonly config: {
      baseUrl: string;
      apiKey: string;
      apiSecret: string;
      timeoutMs: number;
    },
  ) {}

  normalizePaperId(value: string) {
    return normalizeEdasPaperId(value);
  }

  private configured() {
    return Boolean(this.config.baseUrl && this.config.apiKey && this.config.apiSecret);
  }

  async lookupPaper(paperId: string): Promise<EdasPaperSummary | null> {
    const id = this.normalizePaperId(paperId);
    if (!id) return null;
    if (!this.configured()) {
      throw new Error(
        "EDAS live mode is not configured. Set EDAS_BASE_URL, EDAS_API_KEY, and EDAS_API_SECRET to official values.",
      );
    }
    throw new Error(
      "Authenticated EDAS synchronization is not implemented. Replace LiveEdasService.lookupPaper with the documented vendor endpoint.",
    );
  }

  async recordSubmission(input: EdasSubmissionInput): Promise<EdasPaperSummary> {
    return {
      paperId: this.normalizePaperId(input.paperId),
      title: input.title,
      source: "live",
      stage: "submission",
      status: this.configured() ? "pending_vendor_endpoint" : "not_configured",
    };
  }

  async recordReview(input: EdasReviewInput): Promise<EdasPaperSummary> {
    return {
      paperId: this.normalizePaperId(input.paperId),
      source: "live",
      stage: "review",
      status: this.configured() ? "pending_vendor_endpoint" : "not_configured",
      review: { recordedAt: new Date().toISOString(), recommendation: input.recommendation },
    };
  }

  async recordDecision(input: EdasDecisionInput): Promise<EdasPaperSummary> {
    return {
      paperId: this.normalizePaperId(input.paperId),
      source: "live",
      stage: "decision",
      status: this.configured() ? "pending_vendor_endpoint" : "not_configured",
      decision: { recordedAt: new Date().toISOString(), outcome: input.outcome },
    };
  }

  async syncReviewStatus(paperId: string) {
    return this.lookupPaper(paperId);
  }
}
