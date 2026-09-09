import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { MetricType } from "@prisma/client";
import { json } from "@/lib/http";
import { withPublic } from "@/lib/api/guard";
import { recordMetric } from "@/lib/services/metrics";
import { hashSessionId } from "@/lib/csrf";
import { z } from "zod";
import { randomBytes } from "crypto";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  return withPublic(async () => {
    const body = z
      .object({
        articleId: z.string().min(1),
        metricType: z.enum(["PAGE_VIEW", "PDF_DOWNLOAD"]),
      })
      .parse(await request.json());
    const store = await cookies();
    let sid = store.get("journal_metric")?.value;
    if (!sid) sid = randomBytes(16).toString("hex");
    const result = await recordMetric({
      articleId: body.articleId,
      metricType: body.metricType as MetricType,
      sessionHash: hashSessionId(sid),
    });
    const response = json(result);
    response.cookies.set("journal_metric", sid, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  });
}
