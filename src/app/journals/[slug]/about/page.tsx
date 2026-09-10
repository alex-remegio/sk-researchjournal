import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import {
  SKRJET_AIMS,
  SKRJET_ARTICLE_TYPES,
  SKRJET_ABOUT_INTRO,
  SKRJET_FREQUENCY,
  SKRJET_INDEPENDENCE,
  SKRJET_PEER_REVIEW,
  SKRJET_SCOPE,
  SKRJET_SPONSOR,
} from "@/lib/content/skrjet";

export default async function AboutJournal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
  });
  if (!journal) notFound();

  const isSkrjet = slug === "skrjet";

  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <article className="max-w-3xl">
        <h1 className="font-serif text-4xl">About {journal.name}</h1>

        {isSkrjet ? (
          <>
            <div className="mt-6 space-y-4 leading-7 text-ink-800">
              {SKRJET_ABOUT_INTRO.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>

            <h2 className="mt-12 font-serif text-2xl">Aims</h2>
            <p className="mt-3 leading-7 text-ink-800">
              SKRJET aims to promote the culture of research and publication among educators,
              researchers, practitioners, and students by:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-ink-800">
              {SKRJET_AIMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2 className="mt-12 font-serif text-2xl">Scope</h2>
            <p className="mt-3 leading-7 text-ink-800">
              The journal welcomes original research articles, reviews, field reports, policy briefs,
              and other scholarly works in the following domains:
            </p>
            <ul className="mt-4 space-y-3 leading-7 text-ink-800">
              {SKRJET_SCOPE.map((item) => (
                <li key={item.title}>
                  <span className="font-medium text-ink-950">{item.title}:</span> {item.body}
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-7 text-ink-800">
              SKRJET also encourages interdisciplinary research that bridges the fields of education,
              science, and technology toward sustainable development.
            </p>

            <h2 className="mt-12 font-serif text-2xl">Article types</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-ink-800">
              {SKRJET_ARTICLE_TYPES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2 className="mt-12 font-serif text-2xl">Peer review process</h2>
            <p className="mt-3 leading-7 text-ink-800">{SKRJET_PEER_REVIEW}</p>
            <p className="mt-3 text-sm">
              See the full{" "}
              <Link className="underline" href={`/journals/${slug}/peer-review`}>
                peer review process
              </Link>
              .
            </p>

            <h2 className="mt-12 font-serif text-2xl">Publication frequency and fees</h2>
            <p className="mt-3 leading-7 text-ink-800">{SKRJET_FREQUENCY}</p>

            <h2 className="mt-12 font-serif text-2xl">Editorial independence and transparency</h2>
            <p className="mt-3 leading-7 text-ink-800">{SKRJET_INDEPENDENCE}</p>

            <h2 className="mt-12 font-serif text-2xl">Sponsor and source of support</h2>
            <p className="mt-3 leading-7 text-ink-800">{SKRJET_SPONSOR}</p>
          </>
        ) : (
          <div
            className="prose-article mt-6 leading-7"
            dangerouslySetInnerHTML={{ __html: journal.description }}
          />
        )}

        <dl className="mt-12 grid max-w-xl gap-3 border-t border-ink-200 pt-8 text-sm">
          <div>
            <dt className="font-medium">Publisher</dt>
            <dd>{journal.publisher}</dd>
          </div>
          <div>
            <dt className="font-medium">Frequency</dt>
            <dd>{journal.frequency}</dd>
          </div>
          {journal.issnPrint ? (
            <div>
              <dt className="font-medium">ISSN (print)</dt>
              <dd>{journal.issnPrint}</dd>
            </div>
          ) : null}
          {journal.issnOnline ? (
            <div>
              <dt className="font-medium">ISSN (online)</dt>
              <dd>{journal.issnOnline}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium">Peer review</dt>
            <dd>
              Double-blind. See the{" "}
              <Link className="underline" href={`/journals/${slug}/peer-review`}>
                peer review process
              </Link>
              .
            </dd>
          </div>
          <div>
            <dt className="font-medium">Access</dt>
            <dd>Open access · no submission or publication fees</dd>
          </div>
        </dl>
      </article>
    </PublicShell>
  );
}
