"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export function NewArticleButton({ journals }: { journals: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [journalId, setJournalId] = useState(journals[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setError(null);
    try {
      await fetch("/api/auth/csrf");
      const result = await api<{ article: { id: string } }>("/api/articles", {
        method: "POST",
        body: JSON.stringify({ journalId }),
      });
      router.push(`/admin/articles/${result.article.id}/wizard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create article");
    }
  }

  if (!journals.length) return null;
  return (
    <div>
      <button className="rounded bg-ink-950 px-4 py-2 text-white" type="button" onClick={() => setOpen(true)}>
        New article
      </button>
      {open ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded bg-white p-5">
            <h2 className="font-serif text-xl">Create article draft</h2>
            <label className="mt-4 block text-sm" htmlFor="journal">
              Journal
            </label>
            <select
              id="journal"
              className="mt-1 w-full rounded border px-3 py-2"
              value={journalId}
              onChange={(event) => setJournalId(event.target.value)}
            >
              {journals.map((journal) => (
                <option key={journal.id} value={journal.id}>
                  {journal.name}
                </option>
              ))}
            </select>
            {error ? <p className="mt-2 text-sm text-crimson-700">{error}</p> : null}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="rounded bg-ink-950 px-3 py-1 text-white" type="button" onClick={create}>
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
