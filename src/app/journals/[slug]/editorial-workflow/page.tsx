import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import {
  DOUBLE_BLIND_RULES,
  EDITORIAL_WORKFLOW_STEPS,
  EIC_DUTIES,
  MANAGING_EDITOR_DUTIES,
  MANUSCRIPT_STATUSES,
  ROLE_GUIDE_META,
  ROLE_OVERVIEW,
  SECTION_EDITOR_DUTIES,
  WORKFLOW_PIPELINE,
} from "@/lib/content/role-guide";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
    select: { name: true },
  });
  return { title: journal ? `Editorial workflow | ${journal.name}` : "Editorial workflow" };
}

export default async function EditorialWorkflowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
        <h1 className="mt-2 font-serif text-4xl">Editorial workflow &amp; roles</h1>
        <p className="mt-3 text-sm text-ink-600">
          {ROLE_GUIDE_META.title} · {ROLE_GUIDE_META.version}.{" "}
          <a className="underline" href={ROLE_GUIDE_META.pdfHref}>
            Download PDF
          </a>
        </p>

        <p className="mt-6 rounded border border-ink-200 bg-ink-50 p-4 text-sm leading-6 text-ink-800">
          {WORKFLOW_PIPELINE}
        </p>

        <h2 className="mt-10 font-serif text-2xl">Overall editorial workflow</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink-800">
          {EDITORIAL_WORKFLOW_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <h2 className="mt-10 font-serif text-2xl">Roles and access</h2>
        <div className="mt-4 overflow-x-auto border border-ink-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-700">
              <tr>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Primary function</th>
                <th className="px-3 py-2 font-medium">Main permissions</th>
              </tr>
            </thead>
            <tbody>
              {ROLE_OVERVIEW.map((row) => (
                <tr key={row.role} className="border-t border-ink-200 align-top">
                  <td className="px-3 py-2 font-medium text-ink-950">{row.role}</td>
                  <td className="px-3 py-2 text-ink-700">{row.function}</td>
                  <td className="px-3 py-2 text-ink-700">{row.permissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 font-serif text-2xl">Section Editor</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          {SECTION_EDITOR_DUTIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">Managing Editor</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          {MANAGING_EDITOR_DUTIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">Editor-in-Chief</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          {EIC_DUTIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">Double-blind review requirements</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          {DOUBLE_BLIND_RULES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">Manuscript statuses</h2>
        <div className="mt-4 overflow-x-auto border border-ink-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-700">
              <tr>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {MANUSCRIPT_STATUSES.map(([status, meaning]) => (
                <tr key={status} className="border-t border-ink-200">
                  <td className="px-3 py-2 font-medium text-ink-950">{status}</td>
                  <td className="px-3 py-2 text-ink-700">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-sm text-ink-600">
          Related:{" "}
          <Link className="underline" href={`/journals/${slug}/for-authors`}>
            For authors
          </Link>
          {" · "}
          <Link className="underline" href={`/journals/${slug}/for-reviewers`}>
            For reviewers
          </Link>
          {" · "}
          <Link className="underline" href={`/journals/${slug}/peer-review`}>
            Peer review process
          </Link>
        </p>
      </article>
    </PublicShell>
  );
}
