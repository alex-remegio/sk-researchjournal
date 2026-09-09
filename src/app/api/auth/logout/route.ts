import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { env } from "@/lib/env";
import { getSessionFromRequest } from "@/lib/auth/session";
import { writeAuditLog, requestMeta } from "@/lib/audit";
import { json } from "@/lib/http";

const AUTHJS_COOKIES = [
  "authjs.session-token",
  "authjs.csrf-token",
  "authjs.callback-url",
  "__Secure-authjs.session-token",
  "__Host-authjs.csrf-token",
];

export async function POST(request: NextRequest) {
  const user = await getSessionFromRequest(request);
  if (user) {
    await writeAuditLog({
      userId: user.id,
      action: AuditAction.LOGOUT,
      entityType: "User",
      entityId: user.id,
      ...requestMeta(request),
    });
  }
  const response = json({ ok: true });
  response.cookies.set(env.AUTH_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(env.AUTH_CSRF_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  for (const name of AUTHJS_COOKIES) {
    response.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0 });
  }
  return response;
}
