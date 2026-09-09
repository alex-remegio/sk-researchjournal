import { env } from "@/lib/env";
import { LiveEdasService, ManualEdasService, MockEdasService } from "@/lib/edas/implementations";
import type { EdasService } from "@/lib/edas/types";

let instance: EdasService | null = null;

export function getEdasService(): EdasService {
  if (instance) return instance;
  if (env.EDAS_MODE === "live") {
    instance = new LiveEdasService({
      baseUrl: env.EDAS_BASE_URL,
      apiKey: env.EDAS_API_KEY,
      apiSecret: env.EDAS_API_SECRET,
      timeoutMs: env.EDAS_TIMEOUT_MS,
    });
  } else if (env.EDAS_MODE === "manual") {
    instance = new ManualEdasService();
  } else {
    instance = new MockEdasService();
  }
  return instance;
}

export function resetEdasForTests() {
  instance = null;
}

export type { EdasService, EdasPaperSummary } from "@/lib/edas/types";
