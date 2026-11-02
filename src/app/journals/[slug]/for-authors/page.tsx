import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import {
  AUTHOR_ARTICLE_TYPES,
  AUTHOR_DECISIONS,
  AUTHOR_FILE_PACKAGE,
  AUTHOR_GUIDE_CHECKLIST,
  AUTHOR_GUIDE_CONTACTS,
  AUTHOR_GUIDE_FACTS,
  AUTHOR_GUIDE_META,
  AUTHOR_PREPARATION,
} from "@/lib/content/author-guide";

export async function generateMetadata() {
  return { title: "For authors" };
}

export default async function ForAuthorsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
  });
  if (!journal) notFound();

  const isPrimary = slug === "skrjet";

  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <article className="max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-crimson-700">
          {isPrimary ? AUTHOR_GUIDE_META.abbreviation : journal.name}
        </p>
        <h1 className="mt-2 font-serif text-4xl">Guide for authors</h1>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          {isPrimary
            ? `${AUTHOR_GUIDE_META.journal}. ${AUTHOR_GUIDE_META.version}.`
            : "Prepare a complete submission before editorial screening."}{" "}
          {isPrimary ? (
            <a className="font-medium text-navy-700 underline" href={AUTHOR_GUIDE_META.pdfHref}>
              Download the guide (PDF)
            </a>
          ) : null}
        </p>

        {isPrimary ? (
          <dl className="mt-8 grid gap-3 border border-ink-200 bg-white p-4 text-sm sm:grid-cols-2">
            {AUTHOR_GUIDE_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="font-medium text-ink-950">{fact.label}</dt>
                <dd className="text-ink-700">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <h2 className="mt-10 font-serif text-2xl">Submission files</h2>
        <p className="mt-3 text-sm leading-6 text-ink-700">
          A complete submission includes the cover letter, title page, and anonymous manuscript.
          Tables and figures belong in the manuscript unless a file is truly supplementary.
        </p>
        <ul className="mt-4 space-y-4">
          {AUTHOR_FILE_PACKAGE.map((item) => (
            <li key={item.file} className="border border-ink-200 bg-white p-4">
              <h3 className="font-medium text-ink-950">
                {item.file}
                {item.required ? (
                  <span className="ml-2 text-xs uppercase text-crimson-700">Required</span>
                ) : (
                  <span className="ml-2 text-xs uppercase text-ink-500">Optional</span>
                )}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-700">{item.content}</p>
              <p className="mt-2 text-xs text-ink-500">Visibility: {item.visibility}</p>
              {"href" in item && item.href ? (
                <p className="mt-3">
                  <a
                    className="text-sm font-medium text-navy-700 underline"
                    href={item.href}
                    download={item.download}
                  >
                    Download template
                  </a>
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        {isPrimary ? (
          <>
            <h2 className="mt-10 font-serif text-2xl">Article types</h2>
            <ul className="mt-4 space-y-3">
              {AUTHOR_ARTICLE_TYPES.map((item) => (
                <li key={item.type} className="text-sm leading-6 text-ink-800">
                  <span className="font-medium text-ink-950">{item.type}.</span> {item.detail}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-serif text-2xl">Manuscript preparation</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-800">
              {AUTHOR_PREPARATION.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2 className="mt-10 font-serif text-2xl">Editorial decisions</h2>
            <ul className="mt-4 space-y-3">
              {AUTHOR_DECISIONS.map((item) => (
                <li key={item.decision} className="text-sm leading-6 text-ink-800">
                  <span className="font-medium text-ink-950">{item.decision}.</span> {item.detail}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-6 text-ink-700">
              A revision needs a revised manuscript and a response that answers every substantive
              reviewer comment. Extensions are granted by the Editor-in-Chief on request.
            </p>

            <h2 className="mt-10 font-serif text-2xl">Author checklist</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-800">
              {AUTHOR_GUIDE_CHECKLIST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2 className="mt-10 font-serif text-2xl">Editorial office</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-800">
              {AUTHOR_GUIDE_CONTACTS.map((person) => (
                <li key={person.email}>
                  <span className="font-medium text-ink-950">{person.role}:</span> {person.name}
                  {" · "}
                  <a className="underline" href={`mailto:${person.email}`}>
                    {person.email}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-6 text-ink-700">
              Institutional support: Office of the Vice President for Research, Extension, and
              Innovation, Sultan Kudarat State University.
            </p>
          </>
        ) : null}

        <p className="mt-10 text-sm text-ink-600">
          Editorial staff:{" "}
          <Link className="underline" href="/login">
            sign in
          </Link>{" "}
          to start a new submission. Also see{" "}
          <Link className="underline" href={`/journals/${slug}/peer-review`}>
            peer review
          </Link>{" "}
          and the{" "}
          <Link className="underline" href={`/journals/${slug}/editorial-workflow`}>
            editorial workflow
          </Link>
          .
        </p>
      </article>
    </PublicShell>
  );
}
