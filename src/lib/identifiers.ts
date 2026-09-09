const DOI_PATTERN = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i;
const ISSN_PATTERN = /^\d{4}-\d{3}[\dX]$/i;

export function isValidDoi(value: string) {
  return DOI_PATTERN.test(value.trim());
}

export function isValidOrcid(value: string) {
  const normalized = normalizeOrcid(value);
  if (!ORCID_PATTERN.test(normalized)) return false;
  return isValidOrcidChecksum(normalized);
}

export function normalizeOrcid(value: string) {
  const digits = value.replace(/https?:\/\/orcid\.org\//i, "").replace(/[^0-9Xx]/g, "");
  if (digits.length !== 16) return value.trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12)}`.toUpperCase();
}

function isValidOrcidChecksum(orcid: string) {
  const body = orcid.replace(/-/g, "");
  let total = 0;
  for (let i = 0; i < 15; i += 1) {
    total = (total + Number(body[i])) * 2;
  }
  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  const check = result === 10 ? "X" : String(result);
  return body[15].toUpperCase() === check;
}

export function isValidIssn(value: string) {
  return ISSN_PATTERN.test(value.trim().toUpperCase());
}

export function parseNumericPage(value: string | null | undefined) {
  if (!value) return null;
  const match = value.trim().match(/^(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function isValidPageRange(firstPage?: string | null, lastPage?: string | null) {
  if (!firstPage && !lastPage) return true;
  if ((firstPage && !lastPage) || (!firstPage && lastPage)) return false;
  const first = parseNumericPage(firstPage);
  const last = parseNumericPage(lastPage);
  if (first === null || last === null) return true;
  return last >= first;
}
