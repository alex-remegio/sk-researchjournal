"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export function AuthorRevisionForm({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await fetch("/api/auth/csrf");
      await api(`/api/articles/${articleId}/review/revision`, {
        method: "POST",
        body: JSON.stringify({ responseToReviewers: form.get("responseToReviewers") }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit revision");
    }
  }
  return (
    <form className="mt-4 space-y-2" onSubmit={onSubmit}>
      <label className="block text-sm">
        Response to reviewers
        <textarea className="mt-1 w-full rounded border px-3 py-2" name="responseToReviewers" rows={6} required minLength={20} />
      </label>
      {error ? <p className="text-sm text-crimson-700">{error}</p> : null}
      <button className="rounded bg-ink-950 px-3 py-2 text-white" type="submit">
        Submit revision
      </button>
    </form>
  );
}
