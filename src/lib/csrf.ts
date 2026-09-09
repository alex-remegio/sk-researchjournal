import { createHash, randomBytes } from "crypto";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { ForbiddenError } from "@/lib/errors";

export function generateCsrfToken() {
  return randomBytes(32).toString("hex");
}

export function csrfCookieOptions() {
  return {
    name: env.AUTH_CSRF_COOKIE_NAME,
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: env.AUTH_SESSION_TTL_HOURS * 60 * 60,
  };
}

export function allowedRequestOrigins(request: NextRequest) {
  const origins = new Set<string>();
  try {
    origins.add(new URL(env.APP_URL).origin);
  } catch {
    // ignore invalid APP_URL
  }
  origins.add(request.nextUrl.origin);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    request.nextUrl.protocol.replace(":", "") ||
    "http";
  if (host) origins.add(`${proto}://${host}`);
  return origins;
}

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (!allowedRequestOrigins(request).has(origin)) {
    throw new ForbiddenError("Invalid request origin");
  }
}

export function assertCsrf(request: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  assertSameOrigin(request);
  const cookie = request.cookies.get(env.AUTH_CSRF_COOKIE_NAME)?.value;
  const header = request.headers.get("x-csrf-token");
  if (!cookie || !header || cookie !== header) {
    throw new ForbiddenError("Invalid CSRF token");
  }
}

export function hashSessionId(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
