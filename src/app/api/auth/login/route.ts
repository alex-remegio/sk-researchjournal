import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, sessionCookieOptions, loadSessionUser } from "@/lib/auth/session";
import { generateCsrfToken, csrfCookieOptions } from "@/lib/csrf";
import { rateLimit, clientKey } from "@/lib/auth/rate-limit";
import { writeAuditLog, requestMeta } from "@/lib/audit";
import { errorResponse, json } from "@/lib/http";
import { RateLimitError, UnauthorizedError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const body = loginSchema.parse(await request.json());
    const limited = rateLimit(clientKey(ip, body.email.toLowerCase()), 5, 15 * 60 * 1000);
    if (!limited.allowed) throw new RateLimitError("Too many login attempts. Try again later.");

    const user = await prisma.user.findFirst({
      where: { email: body.email.toLowerCase(), deletedAt: null },
    });
    const meta = requestMeta(request);
    const valid = user ? await verifyPassword(body.password, user.passwordHash) : false;
    if (!user || !valid || !user.active) {
      await writeAuditLog({
        userId: user?.id,
        action: AuditAction.LOGIN_FAILED,
        entityType: "User",
        entityId: user?.id,
        ...meta,
      });
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = await createSessionToken(user);
    const session = sessionCookieOptions();
    const csrf = csrfCookieOptions();
    const response = json({
      user: await loadSessionUser(user.id),
    });
    response.cookies.set(session.name, token, session);
    response.cookies.set(csrf.name, generateCsrfToken(), csrf);
    await writeAuditLog({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: "User",
      entityId: user.id,
      ...meta,
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
