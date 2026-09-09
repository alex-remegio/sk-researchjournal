import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { allowedRequestOrigins, assertSameOrigin } from "@/lib/csrf";

function request(url: string, origin?: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: origin ? { origin } : undefined,
  });
}

describe("same-origin CSRF check", () => {
  it("allows the configured APP_URL origin", () => {
    expect(() => assertSameOrigin(request("http://localhost:3000/api/users", "http://localhost:3000"))).not.toThrow();
  });

  it("allows the origin of the incoming request when it differs from APP_URL", () => {
    const req = request("http://localhost:3002/api/users", "http://localhost:3002");
    expect(allowedRequestOrigins(req).has("http://localhost:3002")).toBe(true);
    expect(() => assertSameOrigin(req)).not.toThrow();
  });

  it("rejects a foreign origin", () => {
    expect(() => assertSameOrigin(request("http://localhost:3000/api/users", "https://evil.example"))).toThrow(
      /origin/i,
    );
  });
});
