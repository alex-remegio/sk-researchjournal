import { MetricType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export async function recordMetric(params: {
  articleId: string;
  metricType: MetricType;
  sessionHash: string;
}) {
  const windowMs = env.METRIC_DEDUPE_WINDOW_SECONDS * 1000;
  const existing = await prisma.metricSession.findUnique({
    where: {
      articleId_metricType_sessionHash: {
        articleId: params.articleId,
        metricType: params.metricType,
        sessionHash: params.sessionHash,
      },
    },
  });

  if (existing && Date.now() - existing.lastRecordedAt.getTime() < windowMs) {
    const metric = await prisma.articleMetric.findUnique({
      where: {
        articleId_metricType: {
          articleId: params.articleId,
          metricType: params.metricType,
        },
      },
    });
    return { counted: false, value: metric?.value ?? 0 };
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.metricSession.upsert({
      where: {
        articleId_metricType_sessionHash: {
          articleId: params.articleId,
          metricType: params.metricType,
          sessionHash: params.sessionHash,
        },
      },
      update: { lastRecordedAt: new Date() },
      create: {
        articleId: params.articleId,
        metricType: params.metricType,
        sessionHash: params.sessionHash,
      },
    });
    return tx.articleMetric.upsert({
      where: {
        articleId_metricType: {
          articleId: params.articleId,
          metricType: params.metricType,
        },
      },
      update: { value: { increment: 1 }, recordedAt: new Date() },
      create: {
        articleId: params.articleId,
        metricType: params.metricType,
        value: 1,
      },
    });
  });

  return { counted: true, value: result.value };
}

export function shouldCountMetric(lastRecordedAt: Date | null, now = Date.now(), windowSeconds = 3600) {
  if (!lastRecordedAt) return true;
  return now - lastRecordedAt.getTime() >= windowSeconds * 1000;
}
