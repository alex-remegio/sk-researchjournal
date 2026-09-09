function formatApiError(data: {
  error?: string;
  details?: { fieldErrors?: Record<string, string[] | undefined>; formErrors?: string[] };
}) {
  const fieldMessages = Object.entries(data.details?.fieldErrors ?? {})
    .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`));
  const formMessages = data.details?.formErrors ?? [];
  const details = [...fieldMessages, ...formMessages].filter(Boolean);
  if (details.length) return details.join(". ");
  return data.error || "Request failed";
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const csrf = document.cookie
    .split("; ")
    .find((row) => row.startsWith("journal_csrf="))
    ?.split("=")[1];
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(formatApiError(data));
  }
  return data as T;
}
