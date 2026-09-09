import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import { ArticleView } from "@/components/article/ArticleView";
import { getPublishedArticle } from "@/lib/services/articles";
import { getJournalSettings } from "@/lib/services/settings";
import {
  articleAbsoluteUrl,
  citationMeta,
  openGraph,
  scholarlyJsonLd,
} from "@/lib/scholar";
import { MetricBeacon } from "@/components/article/MetricBeacon";
import { ScholarTags } from "@/components/article/ScholarTags";
import { DiscoveryChannels } from "@/components/publishing/DiscoveryChannels";

type Params = { params: Promise<{ slug: string; articleSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, articleSlug } = await params;
  try {
    const article = await getPublishedArticle(slug, articleSlug);
    const url = articleAbsoluteUrl(article.journal.websiteSlug, article.slug);
    const og = openGraph(article);
    return {
      title: article.title,
      description: article.abstract.replace(/<[^>]+>/g, "").slice(0, 240),
      alternates: { canonical: url },
      openGraph: {
        title: og.title,
        description: og.description,
        url: og.url,
        type: "article",
        images: og.images,
      },
      other: citationMeta(article),
    };
  } catch {
    return { title: "Article" };
  }
}

export default async function ArticlePage({ params }: Params) {
  const { slug, articleSlug } = await params;
  let article;
  try {
    article = await getPublishedArticle(slug, articleSlug);
  } catch {
    notFound();
  }
  const settings = await getJournalSettings(article.journalId);
  const jsonLd = scholarlyJsonLd(article);

  return (
    <PublicShell>
      <JournalNav slug={slug} name={article.journal.name} />
      <ScholarTags article={article} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleView article={article} showMetrics={settings.showPublicMetrics} />
      <DiscoveryChannels article={article} />
      <MetricBeacon articleId={article.id} metricType="PAGE_VIEW" />
    </PublicShell>
  );
}
