import type { ScholarArticle } from "@/lib/scholar";

export function DiscoveryChannels({
  article,
}: {
  article: ScholarArticle & { authors: { author: { orcid?: string | null } }[] };
}) {
  const orcids = article.authors.map((link) => link.author.orcid).filter((value): value is string => Boolean(value));
  return (
    <section className="mx-auto mt-16 max-w-reading border-t border-ink-300 pt-8" aria-labelledby="discovery-heading">
      <h2 id="discovery-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-800">
        Discoverability
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <p className="rounded border border-ink-300 bg-white px-3 py-3 text-sm">
          <span className="block font-semibold tracking-[0.08em]">SCHOLAR</span>
          <span className="mt-1 block text-ink-600">Citation tags on this page for Google Scholar.</span>
        </p>
        <p className="rounded border border-ink-300 bg-white px-3 py-3 text-sm">
          <span className="block font-semibold tracking-[0.08em]">CROSSREF</span>
          {article.doi ? (
            <a className="mt-1 block hover:underline" href={`https://doi.org/${article.doi}`}>
              {article.doi}
            </a>
          ) : (
            <span className="mt-1 block text-ink-600">DOI not registered.</span>
          )}
        </p>
        <p className="rounded border border-ink-300 bg-white px-3 py-3 text-sm">
          <span className="block font-semibold tracking-[0.08em]">ORCID</span>
          {orcids.length ? (
            <span className="mt-1 block space-y-1">
              {orcids.map((orcid) => (
                <a key={orcid} className="block hover:underline" href={`https://orcid.org/${orcid}`}>
                  {orcid}
                </a>
              ))}
            </span>
          ) : (
            <span className="mt-1 block text-ink-600">No author ORCID on this article.</span>
          )}
        </p>
      </div>
    </section>
  );
}
