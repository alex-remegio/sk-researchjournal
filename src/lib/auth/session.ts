import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { UnauthorizedError } from "@/lib/errors";
import { createSessionToken, sessionCookieOptions, verifySessionToken } from "@/lib/auth/token";

export type { TokenPayload } from "@/lib/auth/token";
export { createSessionToken, sessionCookieOptions, verifySessionToken };

export type SessionAssignment = {
  journalId: string;
  role: Role;
  categoryId: string | null;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  assignments: SessionAssignment[];
};

export async function loadSessionUser(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: {
      assignments: {
        select: { journalId: true, role: true, categoryId: true },
      },
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    assignments: user.assignments,
  };
}

async function sessionFromAuthJs(): Promise<SessionUser | null> {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;
    const user = await loadSessionUser(userId);
    if (!user?.active) return null;
    return user;
  } catch {
    return null;
  }
}

async function sessionFromJose(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const payload = await verifySessionToken(token);
    const user = await loadSessionUser(payload.sub);
    if (!user?.active) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const fromAuthJs = await sessionFromAuthJs();
  if (fromAuthJs) return fromAuthJs;
  const store = await cookies();
  return sessionFromJose(store.get(env.AUTH_COOKIE_NAME)?.value);
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const fromAuthJs = await sessionFromAuthJs();
  if (fromAuthJs) return fromAuthJs;
  return sessionFromJose(request.cookies.get(env.AUTH_COOKIE_NAME)?.value);
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionFromCookies();
  if (!user) throw new UnauthorizedError();
  return user;
}
