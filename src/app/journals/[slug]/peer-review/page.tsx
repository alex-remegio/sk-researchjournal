import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import { SKRJET_PEER_REVIEW } from "@/lib/content/skrjet";

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

  const isSkrjet = slug === "skrjet";

  const steps = [
    {
      title: "1. Submission and initial screening",
      body: `Upon submission, the manuscript is screened for scope, formatting, and ethical standards. Only submissions that meet these criteria proceed to peer review.`,
    },
    {
      title: "2. Assignment of reviewers",
      body: `The Editor-in-Chief or Managing Editor assigns at least two independent anonymous reviewers with relevant expertise. Reviewers are selected for academic credentials, research experience, and the absence of conflicts of interest with the authors.`,
    },
    {
      title: "3. Double-blind review",
      body: `Author and reviewer identities are concealed from each other. Reviewers assess originality, methodological rigor, significance, and clarity without regard to author identity.`,
    },
    {
      title: "4. Reviewer recommendations",
      body: `Each reviewer recommends acceptance, minor or major revision, or rejection, with substantive reasons and comments for the authors.`,
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
        <p className="mt-2 font-medium text-ink-800">Journal policy: double-blind reviewing</p>
        <p className="mt-6 leading-7 text-ink-800">
          {isSkrjet
            ? SKRJET_PEER_REVIEW
            : `${journal.name} uses a double-blind peer review process. Author and reviewer identities are concealed from each other. This policy is the working editorial workflow of the journal.`}
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
          {journal.name} follows COPE guidelines. Authors must declare potential conflicts of
          interest. Corresponding authors submit through the editorial system; reviewers and authors
          remain anonymous to each other throughout review.
        </p>
      </article>
    </PublicShell>
  );
}
