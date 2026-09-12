import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import {
  AUTHOR_CHECKLIST,
  AUTHOR_DECLARATIONS,
  AUTHOR_FACING_INSTRUCTIONS,
  FILE_NAMING,
  FOUR_FILE_PACKAGE,
  ROLE_GUIDE_META,
} from "@/lib/content/role-guide";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
    select: { name: true },
  });
  return { title: journal ? `For authors | ${journal.name}` : "For authors" };
}

export default async function ForAuthorsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
  });
  if (!journal) notFound();

  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <article className="max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-crimson-700">{journal.name}</p>
        <h1 className="mt-2 font-serif text-4xl">Guide for authors</h1>
        <p className="mt-3 text-sm text-ink-600">
          Based on the SKRJET Role-Based Guide ({ROLE_GUIDE_META.version}).{" "}
          <a className="underline" href={ROLE_GUIDE_META.pdfHref}>
            Download PDF
          </a>
        </p>

        <h2 className="mt-10 font-serif text-2xl">How to submit</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded border border-ink-200 bg-ink-50 p-4 text-sm leading-6 text-ink-800">
          {AUTHOR_FACING_INSTRUCTIONS}
        </pre>

        <h2 className="mt-10 font-serif text-2xl">Required four-file package</h2>
        <ul className="mt-4 space-y-4">
          {FOUR_FILE_PACKAGE.map((item) => (
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
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">File naming</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-800">
          {FILE_NAMING.map((name) => (
            <li key={name}>
              <code>{name}</code>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">Author declarations</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          {AUTHOR_DECLARATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">Submission checklist</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          {AUTHOR_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

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
