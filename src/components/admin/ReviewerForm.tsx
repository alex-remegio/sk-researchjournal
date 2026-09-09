"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export function ReviewerForm({
  assignmentId,
  status,
  existing,
}: {
  assignmentId: string;
  status: string;
  existing: { recommendation: string; commentsToAuthor: string } | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const field = "mt-1 w-full rounded border px-3 py-2";

  async function invite(accept: boolean) {
    setError(null);
    try {
      await fetch("/api/auth/csrf");
      await api(`/api/reviews/${assignmentId}`, {
        method: "POST",
        body: JSON.stringify({ invitation: true, accept }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update invitation");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await fetch("/api/auth/csrf");
      await api(`/api/reviews/${assignmentId}`, {
        method: "POST",
        body: JSON.stringify({
          recommendation: form.get("recommendation"),
          originality: form.get("originality"),
          significance: form.get("significance"),
          methodology: form.get("methodology"),
          clarity: form.get("clarity"),
          commentsToAuthor: form.get("commentsToAuthor"),
          commentsToEditor: form.get("commentsToEditor"),
        }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review");
    }
  }

  if (existing) {
    return (
      <p className="rounded border bg-white p-4">
        Report submitted ({existing.recommendation.replaceAll("_", " ")}).
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded border bg-white p-5">
      {status === "INVITED" ? (
        <div className="flex gap-2">
          <button className="rounded bg-ink-950 px-3 py-2 text-white" type="button" onClick={() => invite(true)}>
            Accept invitation
          </button>
          <button className="rounded border px-3 py-2" type="button" onClick={() => invite(false)}>
            Decline
          </button>
        </div>
      ) : null}
      {status === "DECLINED" ? <p>You declined this invitation.</p> : null}
      {status === "INVITED" || status === "ACCEPTED" ? (
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm">
            Recommendation
            <select className={field} name="recommendation" defaultValue="MINOR_REVISION">
              <option value="ACCEPT">Accept</option>
              <option value="MINOR_REVISION">Revision — minor</option>
              <option value="MAJOR_REVISION">Revision — major</option>
              <option value="REJECT">Reject</option>
            </select>
          </label>
          <label className="block text-sm">
            Originality
            <textarea className={field} name="originality" rows={3} required minLength={10} />
          </label>
          <label className="block text-sm">
            Significance
            <textarea className={field} name="significance" rows={3} required minLength={10} />
          </label>
          <label className="block text-sm">
            Methodology
            <textarea className={field} name="methodology" rows={3} required minLength={10} />
          </label>
          <label className="block text-sm">
            Clarity
            <textarea className={field} name="clarity" rows={3} required minLength={10} />
          </label>
          <label className="block text-sm">
            Comments to authors
            <textarea className={field} name="commentsToAuthor" rows={5} required minLength={20} />
          </label>
          <label className="block text-sm">
            Confidential comments to the editor
            <textarea className={field} name="commentsToEditor" rows={4} required minLength={10} />
          </label>
          {error ? <p className="text-sm text-crimson-700">{error}</p> : null}
          <button className="rounded bg-crimson-700 px-4 py-2 text-white" type="submit">
            Submit review
          </button>
        </form>
      ) : null}
      {error && status === "INVITED" ? <p className="text-sm text-crimson-700">{error}</p> : null}
    </div>
  );
}
