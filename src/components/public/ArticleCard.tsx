import Link from "next/link";
import { displayName } from "@/lib/authors/name";

type ArticleCardArticle = {
  title: string;
  slug: string;
  firstPage?: string | null;
  lastPage?: string | null;
  doi?: string | null;
  journal: { name: string; websiteSlug: string };
  issue?: { volume: number; issueNumber: number; year: number } | null;
  category?: { name: string } | null;
  authors: Array<{
    author: { firstName: string; middleName?: string | null; lastName: string };
  }>;
};

export function ArticleCard({ article }: { article: ArticleCardArticle }) {
  const href = `/journals/${article.journal.websiteSlug}/articles/${article.slug}`;
  return (
    <li className="p-4">
      <p className="text-xs uppercase text-crimson-700">{article.journal.name}</p>
      {article.category ? <p className="text-xs text-ink-500">{article.category.name}</p> : null}
      <Link className="font-serif text-lg hover:underline" href={href}>
        {article.title}
      </Link>
      <p className="text-sm text-ink-600">{article.authors.map((link) => displayName(link.author)).join(", ")}</p>
      {article.issue ? (
        <p className="mt-1 text-sm text-ink-500">
          Vol. {article.issue.volume}, No. {article.issue.issueNumber} ({article.issue.year})
          {article.firstPage ? ` · pp. ${article.firstPage}–${article.lastPage}` : ""}
        </p>
      ) : null}
    </li>
  );
}
