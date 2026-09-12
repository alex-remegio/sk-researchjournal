import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import {
  REVIEW_CRITERIA,
  REVIEWER_ACCESS,
  REVIEWER_MUST_NOT_SEE,
  ROLE_GUIDE_META,
} from "@/lib/content/role-guide";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
    select: { name: true },
  });
  return { title: journal ? `For reviewers | ${journal.name}` : "For reviewers" };
}

export default async function ForReviewersPage({ params }: { params: Promise<{ slug: string }> }) {
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
        <h1 className="mt-2 font-serif text-4xl">Guide for reviewers</h1>
        <p className="mt-3 text-sm text-ink-600">
          Double-blind peer review · {ROLE_GUIDE_META.version}.{" "}
          <a className="underline" href={ROLE_GUIDE_META.pdfHref}>
            Download full role guide (PDF)
          </a>
        </p>

        <h2 className="mt-10 font-serif text-2xl">Invitation workflow</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink-800">
          <li>Receive invitation.</li>
          <li>View limited manuscript information.</li>
          <li>Declare conflict of interest.</li>
          <li>Accept or decline.</li>
          <li>If accepted, access anonymized manuscript and review form.</li>
          <li>Submit review before deadline.</li>
        </ol>

        <h2 className="mt-10 font-serif text-2xl">What reviewers can access</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          {REVIEWER_ACCESS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">What reviewers must not see</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          {REVIEWER_MUST_NOT_SEE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl">Evaluation form</h2>
        <div className="mt-4 overflow-x-auto border border-ink-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-700">
              <tr>
                <th className="px-3 py-2 font-medium">Criterion</th>
                <th className="px-3 py-2 font-medium">Suggested response</th>
              </tr>
            </thead>
            <tbody>
              {REVIEW_CRITERIA.map((row) => (
                <tr key={row.criterion} className="border-t border-ink-200">
                  <td className="px-3 py-2 text-ink-950">{row.criterion}</td>
                  <td className="px-3 py-2 text-ink-700">{row.scale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-700">
          Separate text boxes are required for comments to the author and confidential comments to
          the editor.
        </p>

        <h2 className="mt-10 font-serif text-2xl">Reviewer ethics</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-800">
          <li>Treat manuscripts as confidential.</li>
          <li>Disclose conflicts.</li>
          <li>Do not use unpublished information for personal advantage.</li>
          <li>Provide respectful and evidence-based comments.</li>
          <li>Do not manipulate citations.</li>
          <li>Do not expose confidential manuscript content to unauthorized AI tools.</li>
        </ul>

        <p className="mt-10 text-sm text-ink-600">
          Invited reviewers:{" "}
          <Link className="underline" href="/login">
            sign in
          </Link>{" "}
          to open your assignments.
        </p>
      </article>
    </PublicShell>
  );
}
