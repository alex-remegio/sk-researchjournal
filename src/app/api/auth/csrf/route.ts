import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { generateCsrfToken, csrfCookieOptions } from "@/lib/csrf";
import { json } from "@/lib/http";

export async function GET() {
  const store = await cookies();
  let token = store.get(env.AUTH_CSRF_COOKIE_NAME)?.value;
  const response = json({ token: token ?? "" });
  if (!token) {
    token = generateCsrfToken();
    const csrf = csrfCookieOptions();
    response.cookies.set(csrf.name, token, csrf);
    return NextResponse.json({ token }, { headers: response.headers });
  }
  return json({ token });
}
