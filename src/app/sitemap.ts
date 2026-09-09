import { env } from "@/lib/env";
import { articlePublicPath } from "@/lib/scholar";

export default async function sitemap() {
  try {
    const { prisma } = await import("@/lib/db");
    const journals = await prisma.journal.findMany({
      where: { deletedAt: null, active: true },
      select: { websiteSlug: true, updatedAt: true },
    });
    const articles = await prisma.article.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, journal: { select: { websiteSlug: true } } },
    });
    const issues = await prisma.issue.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      select: { id: true, updatedAt: true, journal: { select: { websiteSlug: true } } },
    });

    return [
      { url: env.APP_URL, lastModified: new Date() },
      { url: `${env.APP_URL}/search`, lastModified: new Date() },
      ...journals.map((journal) => ({
        url: `${env.APP_URL}/journals/${journal.websiteSlug}`,
        lastModified: journal.updatedAt,
      })),
      ...journals.map((journal) => ({
        url: `${env.APP_URL}/journals/${journal.websiteSlug}/peer-review`,
        lastModified: journal.updatedAt,
      })),
      ...issues.map((issue) => ({
        url: `${env.APP_URL}/journals/${issue.journal.websiteSlug}/issues/${issue.id}`,
        lastModified: issue.updatedAt,
      })),
      ...articles.map((article) => ({
        url: `${env.APP_URL}${articlePublicPath(article.journal.websiteSlug, article.slug)}`,
        lastModified: article.updatedAt,
      })),
    ];
  } catch {
    return [{ url: env.APP_URL, lastModified: new Date() }];
  }
}
