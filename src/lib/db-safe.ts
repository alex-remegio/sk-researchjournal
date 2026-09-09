import { prisma } from "@/lib/db";

export type DbFailure = {
  ok: false;
  message: string;
  code?: string;
};

export async function withDatabase<T>(
  run: () => Promise<T>,
): Promise<{ ok: true; data: T } | DbFailure> {
  if (!process.env.DATABASE_URL?.trim()) {
    return {
      ok: false,
      message:
        "DATABASE_URL is not set. Add it in Vercel → Environment Variables (Secret), then redeploy.",
    };
  }

  try {
    return { ok: true, data: await run() };
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: string }).code)
        : undefined;
    const raw = error instanceof Error ? error.message : "Unknown database error";
    const message =
      code === "P1001" || /can't reach database|ECONNREFUSED|ENOTFOUND/i.test(raw)
        ? "Cannot reach the database. Check DATABASE_URL host, password, and that the Neon/Supabase project is running."
        : code === "P2021" || /does not exist/i.test(raw)
          ? "Database connected, but tables are missing. Run: npx prisma migrate deploy"
          : `Database error: ${raw}`;
    return { ok: false, message, code };
  }
}

export async function checkDatabase() {
  return withDatabase(async () => {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  });
}
