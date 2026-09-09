import { env } from "@/lib/env";
import { isValidOrcid, normalizeOrcid } from "@/lib/identifiers";

export type OrcidMode = "mock" | "live";

export type OrcidPerson = {
  orcid: string;
  givenNames?: string;
  familyName?: string;
  creditName?: string;
  source: OrcidMode;
};

export interface OrcidService {
  mode: OrcidMode;
  lookup(orcid: string): Promise<OrcidPerson | null>;
}

const MOCK_RECORDS: Record<string, Omit<OrcidPerson, "orcid" | "source">> = {
  "0000-0002-1825-0097": { givenNames: "Josiah", familyName: "Carberry", creditName: "Josiah Carberry" },
  "0000-0001-5109-3700": { givenNames: "Alex", familyName: "Remegio", creditName: "Alex N. Remegio" },
};

export class MockOrcidService implements OrcidService {
  mode = "mock" as const;

  async lookup(orcid: string): Promise<OrcidPerson | null> {
    const id = normalizeOrcid(orcid);
    if (!isValidOrcid(id)) return null;
    const record = MOCK_RECORDS[id] ?? { creditName: `ORCID ${id}` };
    return { orcid: id, source: this.mode, ...record };
  }
}

export class LiveOrcidService implements OrcidService {
  mode = "live" as const;

  constructor(private readonly apiUrl: string) {}

  async lookup(orcid: string): Promise<OrcidPerson | null> {
    const id = normalizeOrcid(orcid);
    if (!isValidOrcid(id)) return null;
    const response = await fetch(`${this.apiUrl.replace(/\/$/, "")}/${id}/person`, {
      headers: { Accept: "application/vnd.orcid+json" },
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`ORCID lookup failed (${response.status})`);
    }
    const data = (await response.json()) as {
      name?: {
        "given-names"?: { value?: string };
        "family-name"?: { value?: string };
        "credit-name"?: { value?: string };
      };
    };
    return {
      orcid: id,
      source: this.mode,
      givenNames: data.name?.["given-names"]?.value,
      familyName: data.name?.["family-name"]?.value,
      creditName: data.name?.["credit-name"]?.value,
    };
  }
}

let instance: OrcidService | null = null;

export function getOrcidService(): OrcidService {
  if (instance) return instance;
  instance = env.ORCID_MODE === "live" ? new LiveOrcidService(env.ORCID_API_URL) : new MockOrcidService();
  return instance;
}

export function resetOrcidForTests() {
  instance = null;
}

export function orcidUrl(orcid: string) {
  return `https://orcid.org/${normalizeOrcid(orcid)}`;
}
