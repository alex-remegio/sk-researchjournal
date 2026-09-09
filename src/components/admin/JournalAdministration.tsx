import Link from "next/link";
import type { JournalAdministrationData } from "@/lib/services/administration";
import { formatRecentArticleStatus, truncateArticleTitle } from "@/lib/lifecycle/article";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-1">
      <dt className="text-ink-800">{label}</dt>
      <dd className="tabular-nums text-ink-950">{formatCount(value)}</dd>
    </div>
  );
}

export function JournalAdministration({
  data,
}: {
  data: JournalAdministrationData;
}) {
  const articlesHref = data.journalId
    ? (status: string) => `/admin/articles?status=${status}&journalId=${data.journalId}`
    : (status: string) => `/admin/articles?status=${status}`;
  return (
    <Card className="max-w-xl shadow-none">
      <CardHeader>
        <CardTitle>JOURNAL ADMINISTRATION</CardTitle>
        {data.journalName ? <p className="mt-1 text-sm text-ink-600">{data.journalName}</p> : null}
      </CardHeader>

      <CardContent>
        <dl>
          <StatRow label="Published Articles" value={data.publishedArticles} />
          <StatRow label="Current Issues" value={data.currentIssues} />
          <StatRow label="Total Authors" value={data.totalAuthors} />
          <StatRow label="PDF Downloads" value={data.pdfDownloads} />
        </dl>
      </CardContent>

      <CardContent className="border-t border-ink-300">
        <h2 className="text-sm font-semibold tracking-[0.08em] text-ink-800">PUBLICATION QUEUE</h2>
        <ul className="mt-3 space-y-1">
          <li>
            <Link className="hover:underline" href={articlesHref("DRAFT")}>
              {data.queue.draft} Draft
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href={articlesHref("READY_FOR_PUBLICATION")}>
              {data.queue.readyForPublication} Accepted
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href={articlesHref("SCHEDULED")}>
              {data.queue.scheduled} Scheduled
            </Link>
          </li>
        </ul>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch">
        <h2 className="text-sm font-semibold tracking-[0.08em] text-ink-800">RECENT ARTICLES</h2>
        <ul className="mt-3 space-y-2">
          {data.recent.map((article) => (
            <li key={article.id} className="flex items-baseline justify-between gap-4 text-sm">
              <Link className="min-w-0 truncate hover:underline" href={`/admin/articles/${article.id}/wizard`} title={article.title}>
                {truncateArticleTitle(article.title)}
              </Link>
              <Badge variant="outline">{formatRecentArticleStatus(article.status)}</Badge>
            </li>
          ))}
          {!data.recent.length ? <li className="text-sm text-ink-500">No articles yet.</li> : null}
        </ul>
      </CardFooter>
    </Card>
  );
}
