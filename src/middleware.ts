import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { verifySessionToken } from "@/lib/auth/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(env.AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    try {
      const payload = await verifySessionToken(token);
      if (payload.role === "READER") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
