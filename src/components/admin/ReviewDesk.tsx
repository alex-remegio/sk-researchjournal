"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

type ReviewDeskProps = {
  packet: any;
  reviewers: { id: string; name: string; email: string; role: string }[];
  canScreen: boolean;
  canDecide: boolean;
};

export function ReviewDesk({ packet, reviewers, canScreen, canDecide }: ReviewDeskProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState("");
  const [reviewerId, setReviewerId] = useState(reviewers[0]?.id ?? "");
  const inputClass = "mt-1 w-full rounded border border-ink-300 px-3 py-2";

  async function post(path: string, body: unknown) {
    setError(null);
    try {
      await fetch("/api/auth/csrf");
      await api(path, { method: "POST", body: JSON.stringify(body) });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase text-crimson-700">Single-blind peer review</p>
        <h1 className="font-serif text-3xl">{packet.title}</h1>
        <p className="mt-2 text-ink-600">
          {packet.journal.name} · {String(packet.status).replaceAll("_", " ")}
        </p>
        <p className="mt-2 text-sm">
          Authors (visible to reviewers):{" "}
          {packet.authors.map((link: { author: { firstName: string; lastName: string; middleName?: string | null } }) =>
            [link.author.firstName, link.author.middleName, link.author.lastName].filter(Boolean).join(" "),
          ).join(", ")}
        </p>
        {packet.edasPaperId ? (
          <p className="mt-2 text-sm text-ink-600">
            EDAS {packet.edasPaperId}
            {packet.edas?.stage ? ` · ${packet.edas.stage}` : ""}
            {packet.edas?.status ? ` · ${String(packet.edas.status).replaceAll("_", " ")}` : ""}
          </p>
        ) : null}
        <p className="mt-3">
          <Link className="underline" href={`/admin/articles/${packet.id}/wizard`}>
            Open production record
          </Link>
        </p>
      </div>
      {error ? <p className="text-sm text-crimson-700">{error}</p> : null}

      <section className="rounded border bg-white p-5">
        <h2 className="font-serif text-xl">Abstract</h2>
        <div className="mt-3 leading-7" dangerouslySetInnerHTML={{ __html: packet.abstract }} />
      </section>

      {canScreen && packet.status === "SUBMITTED" ? (
        <section className="rounded border bg-white p-5">
          <h2 className="font-serif text-xl">1. Initial screening</h2>
          <p className="mt-2 text-sm text-ink-600">
            Check scope, formatting, and ethics. Send suitable manuscripts to anonymous reviewers, or
            desk-reject with reasons.
          </p>
          <textarea className={inputClass} rows={5} value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="Letter to authors" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded bg-ink-950 px-3 py-2 text-white" type="button" onClick={() => post(`/api/articles/${packet.id}/review/screen`, { action: "SEND_TO_REVIEW", letterToAuthors: letter })}>
              Send to peer review
            </button>
            <button className="rounded border px-3 py-2" type="button" onClick={() => post(`/api/articles/${packet.id}/review/screen`, { action: "DESK_REJECT", letterToAuthors: letter })}>
              Desk reject
            </button>
          </div>
        </section>
      ) : null}

      {canScreen && packet.status === "REVISED" ? (
        <section className="rounded border bg-white p-5">
          <h2 className="font-serif text-xl">6. Further evaluation of revision</h2>
          <p className="mt-2 text-sm text-ink-600">
            Confirm that reviewer concerns were addressed. Send the revision back to reviewers, or
            proceed to the Editor-in-Chief decision below.
          </p>
          <textarea className={inputClass} rows={5} value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="Letter to authors" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded bg-ink-950 px-3 py-2 text-white" type="button" onClick={() => post(`/api/articles/${packet.id}/review/screen`, { action: "SEND_TO_REVIEW", letterToAuthors: letter })}>
              Send revision to reviewers
            </button>
            <button className="rounded border px-3 py-2" type="button" onClick={() => post(`/api/articles/${packet.id}/review/screen`, { action: "DESK_REJECT", letterToAuthors: letter })}>
              Reject revision
            </button>
          </div>
        </section>
      ) : null}

      {canScreen && packet.status === "FOR_REVIEW" ? (
        <section className="rounded border bg-white p-5">
          <h2 className="font-serif text-xl">2. Assign reviewers</h2>
          <p className="mt-2 text-sm text-ink-600">
            Reviewers stay anonymous to authors. Author names are shown to reviewers.
          </p>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              void post(`/api/articles/${packet.id}/review/assign`, { reviewerId });
            }}
          >
            <select className={inputClass} value={reviewerId} onChange={(e) => setReviewerId(e.target.value)}>
              {reviewers.map((reviewer) => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.name} ({reviewer.email})
                </option>
              ))}
            </select>
            <button className="rounded bg-ink-950 px-3 py-2 text-white" type="submit">
              Assign
            </button>
          </form>
        </section>
      ) : null}

      <section className="rounded border bg-white p-5">
        <h2 className="font-serif text-xl">Reviews and recommendations</h2>
        {packet.rounds.map((round: any) => (
          <div key={round.id} className="mt-4 border-t pt-4">
            <h3 className="font-medium">Round {round.roundNumber}</h3>
            <ul className="mt-3 space-y-4">
              {round.assignments.map((assignment: any) => (
                <li key={assignment.id} className="rounded bg-ink-50 p-3 text-sm">
                  <p>
                    {assignment.label} · {assignment.status}
                    {assignment.report ? ` · ${assignment.report.recommendation}` : ""}
                  </p>
                  {assignment.report ? (
                    <div className="mt-2 space-y-1">
                      <p>
                        <strong>To authors:</strong> {assignment.report.commentsToAuthor.replace(/<[^>]+>/g, "")}
                      </p>
                      {packet.viewerRole !== "author" && assignment.report.commentsToEditor ? (
                        <p>
                          <strong>Confidential to editor:</strong> {assignment.report.commentsToEditor.replace(/<[^>]+>/g, "")}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-ink-500">No report yet.</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {canDecide && (packet.status === "FOR_REVIEW" || packet.status === "REVISED") ? (
        <section className="rounded border bg-white p-5">
          <h2 className="font-serif text-xl">5–7. Editorial decision</h2>
          <p className="mt-2 text-sm text-ink-600">
            The Editor-in-Chief issues the decision and the letter that authors will see with
            anonymized reviewer comments.
          </p>
          <DecisionForm articleId={packet.id} onError={setError} />
        </section>
      ) : null}

      {packet.editorialDecisions?.length ? (
        <section className="rounded border bg-white p-5">
          <h2 className="font-serif text-xl">Decision history</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {packet.editorialDecisions.map((decision: any) => (
              <li key={decision.id}>
                <strong>{decision.decision.replaceAll("_", " ")}</strong>
                <div className="mt-1" dangerouslySetInnerHTML={{ __html: decision.letterToAuthors }} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function DecisionForm({ articleId, onError }: { articleId: string; onError: (value: string | null) => void }) {
  const router = useRouter();
  const [decision, setDecision] = useState("MINOR_REVISION");
  const [letter, setLetter] = useState("");
  return (
    <form
      className="mt-3 space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        onError(null);
        try {
          await fetch("/api/auth/csrf");
          await api(`/api/articles/${articleId}/review/decision`, {
            method: "POST",
            body: JSON.stringify({ decision, letterToAuthors: letter }),
          });
          router.refresh();
        } catch (err) {
          onError(err instanceof Error ? err.message : "Decision failed");
        }
      }}
    >
      <select className="w-full rounded border px-3 py-2" value={decision} onChange={(e) => setDecision(e.target.value)}>
        <option value="ACCEPT">Accept</option>
        <option value="MINOR_REVISION">Revision (minor)</option>
        <option value="MAJOR_REVISION">Revision (major)</option>
        <option value="REJECT">Reject</option>
      </select>
      <textarea className="w-full rounded border px-3 py-2" rows={5} value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="Decision letter to authors" required />
      <button className="rounded bg-crimson-700 px-4 py-2 text-white" type="submit">
        Record decision
      </button>
    </form>
  );
}
