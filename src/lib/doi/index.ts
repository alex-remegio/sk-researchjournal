import { env } from "@/lib/env";
import { LiveCrossrefService, ManualCrossrefService, MockCrossrefService } from "@/lib/doi/implementations";
import type { CrossrefService } from "@/lib/doi/types";

let instance: CrossrefService | null = null;

export function getCrossrefService(): CrossrefService {
  if (instance) return instance;
  if (env.CROSSREF_MODE === "live") {
    instance = new LiveCrossrefService({
      apiUrl: env.CROSSREF_API_URL,
      login: env.CROSSREF_LOGIN,
      password: env.CROSSREF_PASSWORD,
      depositorName: env.CROSSREF_DEPOSITOR_NAME,
      depositorEmail: env.CROSSREF_DEPOSITOR_EMAIL,
      prefix: env.CROSSREF_PREFIX,
    });
  } else if (env.CROSSREF_MODE === "manual") {
    instance = new ManualCrossrefService();
  } else {
    instance = new MockCrossrefService();
  }
  return instance;
}

export function resetCrossrefForTests() {
  instance = null;
}

export type { CrossrefService, CrossrefDepositResult } from "@/lib/doi/types";
