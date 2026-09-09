import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MetricType } from "@prisma/client";
import { getPublishedArticle } from "@/lib/services/articles";
import { prisma } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { recordMetric } from "@/lib/services/metrics";
import { hashSessionId } from "@/lib/csrf";
import { randomBytes } from "crypto";
import { env } from "@/lib/env";

type Params = { params: Promise<{ slug: string; articleSlug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { slug, articleSlug } = await params;
  const article = await getPublishedArticle(slug, articleSlug);
  const file = await prisma.articleFile.findFirst({
    where: { articleId: article.id, fileType: "FINAL_PDF" },
    orderBy: { createdAt: "desc" },
  });
  if (!file) {
    return NextResponse.json({ error: "PDF not available" }, { status: 404 });
  }
  const stored = await getStorage().get(file.storageKey);
  if (!stored) {
    return NextResponse.json({ error: "PDF not available" }, { status: 404 });
  }

  const store = await cookies();
  let sid = store.get("journal_metric")?.value;
  if (!sid) sid = randomBytes(16).toString("hex");
  await recordMetric({
    articleId: article.id,
    metricType: MetricType.PDF_DOWNLOAD,
    sessionHash: hashSessionId(sid),
  });

  const response = new NextResponse(new Uint8Array(stored.body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${file.originalName}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600",
    },
  });
  response.cookies.set("journal_metric", sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
