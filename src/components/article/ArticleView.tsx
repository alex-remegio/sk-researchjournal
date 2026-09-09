import Link from "next/link";
import type { ScholarArticle } from "@/lib/scholar";
import { articlePublicPath, formatCitation, formatDate } from "@/lib/scholar";
import { displayName } from "@/lib/authors/name";

function Divider() {
  return <hr className="my-8 border-ink-400" />;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 py-0.5 text-sm">
      <dt className="text-ink-600">{label}</dt>
      <dd>{value || ""}</dd>
    </div>
  );
}

export function ArticleView({
  article,
  showMetrics,
  preview = false,
}: {
  article: ScholarArticle & {
    category?: { name: string } | null;
    metrics?: { metricType: string; value: number }[];
    references?: { id: string; referenceText: string; doi?: string | null; url?: string | null }[];
    files?: { id: string; fileType: string; originalName: string; publicUrl: string }[];
  };
  showMetrics?: boolean;
  preview?: boolean;
}) {
  const views = article.metrics?.find((m) => m.metricType === "PAGE_VIEW")?.value ?? 0;
  const downloads = article.metrics?.find((m) => m.metricType === "PDF_DOWNLOAD")?.value ?? 0;
  const href = articlePublicPath(article.journal.websiteSlug, article.slug);
  const pdfHref = preview ? article.pdfUrl : `${href}/pdf`;
  const affiliations = article.authors
    .map((link) => link.affiliationText || link.author.affiliation)
    .filter((value, index, all) => value && all.indexOf(value) === index);

  return (
    <article className="mx-auto max-w-reading">
      <header>
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-ink-900">
          {article.journal.name.toUpperCase()}
        </p>
        {article.issue ? (
          <p className="mt-3 text-center text-sm text-ink-600">
            Volume {article.issue.volume} · Issue {article.issue.issueNumber} · {article.issue.year}
          </p>
        ) : null}
        <Divider />
        <h1 className="font-serif text-3xl leading-snug text-ink-950 md:text-4xl">{article.title}</h1>
        <ul className="mt-6 space-y-1 text-ink-800">
          {article.authors.map((link) => (
            <li key={link.authorId}>
              {preview ? (
                <span>{displayName(link.author)}</span>
              ) : (
                <Link className="hover:underline" href={`/authors/${link.authorId}`}>
                  {displayName(link.author)}
                </Link>
              )}
              {link.author.orcid ? (
                <>
                  {" "}
                  <a
                    className="text-xs text-ink-600 hover:underline"
                    href={`https://orcid.org/${link.author.orcid}`}
                  >
                    ORCID
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ul>
        {affiliations.length ? <p className="mt-4 text-sm text-ink-700">{affiliations.join("; ")}</p> : null}
        {article.doi ? (
          <p className="mt-4 text-sm">
            DOI:{" "}
            <a href={`https://doi.org/${article.doi}`}>{article.doi}</a>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-start gap-4 text-sm">
          {pdfHref ? (
            <a className="rounded border border-ink-800 px-3 py-1.5 tracking-wide hover:bg-ink-100" href={pdfHref}>
              [ PDF ]
            </a>
          ) : null}
          <details className="rounded border border-ink-800 px-3 py-1.5">
            <summary className="cursor-pointer tracking-wide">[ Cite ]</summary>
            <p className="mt-3 max-w-md text-sm leading-6 text-ink-800">{formatCitation(article)}</p>
          </details>
          <a className="rounded border border-ink-800 px-3 py-1.5 tracking-wide hover:bg-ink-100" href={href}>
            [ Share ]
          </a>
        </div>
      </header>

      <Divider />

      <section aria-labelledby="abstract-heading">
        <h2 id="abstract-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-800">
          ABSTRACT
        </h2>
        <div className="prose-article mt-4 leading-7 text-ink-800" dangerouslySetInnerHTML={{ __html: article.abstract }} />
        {article.keywords.length ? (
          <p className="mt-6 text-sm">
            <span className="font-semibold">Keywords</span>
            <span className="mt-1 block text-ink-800">
              {article.keywords.map((item) => item.keyword).join(" • ")}
            </span>
          </p>
        ) : null}
      </section>

      <Divider />

      <section aria-labelledby="article-information-heading">
        <h2 id="article-information-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-800">
          Article Information
        </h2>
        <dl className="mt-4">
          <InfoRow label="Received:" value={formatDate(article.createdAt)} />
          <InfoRow label="Accepted:" value={formatDate(article.approvedAt)} />
          <InfoRow label="Published:" value={formatDate(article.publicationDate ?? article.publishedAt)} />
        </dl>
        <dl className="mt-4">
          <InfoRow label="Volume:" value={article.issue?.volume} />
          <InfoRow label="Issue:" value={article.issue?.issueNumber} />
          <InfoRow label="Pages:" value={article.firstPage ? `${article.firstPage}–${article.lastPage}` : ""} />
        </dl>
      </section>

      <Divider />

      <section aria-labelledby="references-heading">
        <h2 id="references-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-800">
          REFERENCES
        </h2>
        {article.references?.length ? (
          <ol className="mt-4 space-y-3 text-sm leading-6">
            {article.references.map((reference, index) => (
              <li key={reference.id} className="grid grid-cols-[1.5rem_1fr] gap-2">
                <span>{index + 1}.</span>
                <span>
                  {reference.referenceText}
                  {reference.doi ? (
                    <>
                      {" "}
                      <a href={`https://doi.org/${reference.doi}`}>https://doi.org/{reference.doi}</a>
                    </>
                  ) : null}
                  {reference.url ? (
                    <>
                      {" "}
                      <a href={reference.url}>{reference.url}</a>
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <ol className="mt-4 space-y-3 text-sm text-ink-400">
            <li>1.</li>
            <li>2.</li>
            <li>3.</li>
          </ol>
        )}
      </section>

      {article.files?.some((file) => file.fileType === "SUPPLEMENTARY") ? (
        <>
          <Divider />
          <section aria-labelledby="files-heading">
            <h2 id="files-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-800">
              Files
            </h2>
            <ul className="mt-3 list-disc pl-5 text-sm">
              {article.files
                .filter((file) => file.fileType === "SUPPLEMENTARY")
                .map((file) => (
                  <li key={file.id}>
                    <a href={file.publicUrl}>{file.originalName}</a>
                  </li>
                ))}
            </ul>
          </section>
        </>
      ) : null}

      {showMetrics ? (
        <>
          <Divider />
          <section aria-labelledby="metrics-heading">
            <h2 id="metrics-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-800">
              METRICS
            </h2>
            <dl className="mt-4 max-w-xs">
              <div className="flex justify-between gap-6 py-0.5 text-sm">
                <dt>Abstract Views</dt>
                <dd className="tabular-nums">{views.toLocaleString("en-US")}</dd>
              </div>
              <div className="flex justify-between gap-6 py-0.5 text-sm">
                <dt>PDF Downloads</dt>
                <dd className="tabular-nums">{downloads.toLocaleString("en-US")}</dd>
              </div>
            </dl>
          </section>
        </>
      ) : null}
    </article>
  );
}
