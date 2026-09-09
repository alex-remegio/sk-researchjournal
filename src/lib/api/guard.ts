import { NextRequest } from "next/server";
import { requireSession, type SessionUser } from "@/lib/auth/session";
import { assertCsrf } from "@/lib/csrf";
import { requestMeta } from "@/lib/audit";
import { errorResponse } from "@/lib/http";
import { UnauthorizedError } from "@/lib/errors";
import { rateLimit, clientKey } from "@/lib/auth/rate-limit";
import { RateLimitError } from "@/lib/errors";

export type ApiContext = {
  user: SessionUser;
  meta: { ipAddress?: string | null; userAgent?: string | null };
};

export async function withAuth(
  request: NextRequest,
  handler: (ctx: ApiContext) => Promise<Response>,
  options?: { csrf?: boolean; mutateLimit?: boolean },
) {
  try {
    if (options?.csrf !== false && !["GET", "HEAD"].includes(request.method)) {
      assertCsrf(request);
    }
    if (options?.mutateLimit && !["GET", "HEAD"].includes(request.method)) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
      const result = rateLimit(clientKey(ip, "mutate"), 120, 60_000);
      if (!result.allowed) throw new RateLimitError();
    }
    const user = await requireSession();
    if (!user.active) throw new UnauthorizedError("Account is suspended");
    return await handler({ user, meta: requestMeta(request) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function withPublic(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    return errorResponse(error);
  }
}
