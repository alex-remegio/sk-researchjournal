import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";
import { UnauthorizedError } from "@/lib/errors";

export type TokenRole =
  | "SUPER_ADMIN"
  | "EDITOR_IN_CHIEF"
  | "MANAGING_EDITOR"
  | "SECTION_EDITOR"
  | "AUTHOR"
  | "REVIEWER"
  | "READER";

export type TokenPayload = {
  sub: string;
  email: string;
  role: TokenRole;
};

const encoder = new TextEncoder();

function secretKey() {
  return encoder.encode(env.AUTH_SECRET);
}

export async function createSessionToken(user: { id: string; email: string; role: TokenRole }) {
  const ttlHours = env.AUTH_SESSION_TTL_HOURS;
  return new SignJWT({ email: user.email, role: user.role } satisfies Omit<TokenPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(user.id)
    .setExpirationTime(`${ttlHours}h`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
  if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string") {
    throw new UnauthorizedError("Invalid session");
  }
  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role as TokenRole,
  };
}

export function sessionCookieOptions() {
  return {
    name: env.AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: env.AUTH_SESSION_TTL_HOURS * 60 * 60,
  };
}
