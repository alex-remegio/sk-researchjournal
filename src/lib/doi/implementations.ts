import type { CrossrefDepositInput, CrossrefDepositResult, CrossrefMode, CrossrefService } from "@/lib/doi/types";

class InMemoryCrossrefService implements CrossrefService {
  private deposits = new Map<string, CrossrefDepositResult>();

  constructor(public mode: Exclude<CrossrefMode, "live">) {}

  async registerArticle(input: CrossrefDepositInput): Promise<CrossrefDepositResult> {
    const result: CrossrefDepositResult = {
      doi: input.doi.trim(),
      status: this.mode === "mock" ? "registered" : "recorded",
      source: this.mode,
      depositedAt: new Date().toISOString(),
      resourceUrl: input.resourceUrl,
    };
    this.deposits.set(result.doi, result);
    return { ...result };
  }

  async lookup(doi: string): Promise<CrossrefDepositResult | null> {
    const key = doi.trim();
    if (!key) return null;
    const existing = this.deposits.get(key);
    if (existing) return { ...existing };
    if (this.mode === "mock") {
      return {
        doi: key,
        status: "registered",
        source: this.mode,
        depositedAt: new Date().toISOString(),
      };
    }
    return null;
  }
}

export class MockCrossrefService extends InMemoryCrossrefService {
  constructor() {
    super("mock");
  }
}

export class ManualCrossrefService extends InMemoryCrossrefService {
  constructor() {
    super("manual");
  }
}

export class LiveCrossrefService implements CrossrefService {
  mode = "live" as const;

  constructor(
    private readonly config: {
      apiUrl: string;
      login: string;
      password: string;
      depositorName: string;
      depositorEmail: string;
      prefix: string;
    },
  ) {}

  private configured() {
    return Boolean(
      this.config.apiUrl &&
        this.config.login &&
        this.config.password &&
        this.config.depositorName &&
        this.config.depositorEmail,
    );
  }

  async registerArticle(input: CrossrefDepositInput): Promise<CrossrefDepositResult> {
    return {
      doi: input.doi.trim(),
      status: this.configured() ? "pending_vendor_endpoint" : "not_configured",
      source: "live",
      depositedAt: new Date().toISOString(),
      resourceUrl: input.resourceUrl,
    };
  }

  async lookup(_doi: string): Promise<CrossrefDepositResult | null> {
    if (!this.configured()) {
      throw new Error(
        "Crossref live mode is not configured. Set CROSSREF_LOGIN, CROSSREF_PASSWORD, CROSSREF_DEPOSITOR_NAME, and CROSSREF_DEPOSITOR_EMAIL.",
      );
    }
    throw new Error(
      "Authenticated Crossref deposit lookup is not implemented. Replace LiveCrossrefService.lookup with the Crossref deposit API.",
    );
  }
}
