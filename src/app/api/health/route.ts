import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/db-safe";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await checkDatabase();
  const body = {
    ok: db.ok,
    app: env.APP_NAME,
    appUrl: env.APP_URL,
    database: db.ok ? "ok" : db.message,
  };
  return NextResponse.json(body, { status: db.ok ? 200 : 503 });
}
