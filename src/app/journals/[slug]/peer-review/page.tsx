import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
    select: { name: true },
  });
  return { title: journal ? `Peer review process | ${journal.name}` : "Peer review process" };
}

export default async function PeerReviewPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
  });
  if (!journal) notFound();

  const steps = [
    {
      title: "1. Submission and initial screening",
      body: `Upon submission, the manuscript is screened for scope, formatting, and ethical standards. Only submissions that meet these criteria proceed to peer review.`,
    },
    {
      title: "2. Assignment of reviewers",
      body: `The Editor-in-Chief or Associate Editor assigns anonymous reviewers with relevant expertise. Reviewers are selected for academic credentials, research experience, and the absence of conflicts of interest with the authors.`,
    },
    {
      title: "3. Single-blind review",
      body: `Reviewers remain anonymous to authors. Author identities are disclosed to reviewers so they can give informed, constructive feedback. Reviewers assess originality, significance, methodology, clarity, and scholarly standards.`,
    },
    {
      title: "4. Reviewer recommendations",
      body: `Each reviewer recommends acceptance, revision with specific improvements, or rejection, with substantive reasons and comments for the authors.`,
    },
    {
      title: "5. Editorial decision",
      body: `The Editor-in-Chief synthesizes the reviews, considering scholarly merit, journal scope, and ethics. The decision and anonymized reviewer comments are sent to the authors.`,
    },
    {
      title: "6. Author response and revision",
      body: `Authors may respond to the reviews and submit a revised manuscript. Revised papers are evaluated again to confirm that the concerns have been addressed.`,
    },
    {
      title: "7. Final decision and publication",
      body: `The Editor-in-Chief then accepts, requests further revision, or rejects the paper. Accepted manuscripts move to production and publication.`,
    },
  ];

  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <article className="max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-crimson-700">{journal.name}</p>
        <h1 className="mt-2 font-serif text-4xl">Peer review process</h1>
        <p className="mt-2 font-medium text-ink-800">Journal policy: single-blind reviewing</p>
        <p className="mt-6 leading-7 text-ink-800">
          {journal.name} uses a single-blind peer review process. Reviewers know who the authors
          are; authors do not know who the reviewers are. This policy is the working editorial
          workflow of the journal, not a statement of intent only.
        </p>
        <ol className="mt-10 space-y-8">
          {steps.map((step) => (
            <li key={step.title}>
              <h2 className="font-serif text-2xl">{step.title}</h2>
              <p className="mt-3 leading-7 text-ink-800">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-ink-600">
          Corresponding authors submit through the editorial system. Assigned reviewers receive the
          author list with the manuscript. Authors receive reviewer comments without reviewer names.
        </p>
      </article>
    </PublicShell>
  );
}
