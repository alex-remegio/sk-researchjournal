"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/client/api";
import { useRouter } from "next/navigation";

export function IssueAdminForm({ journals }: { journals: { id: string; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await fetch("/api/auth/csrf");
      await api("/api/issues", {
        method: "POST",
        body: JSON.stringify({
          journalId: form.get("journalId"),
          volume: Number(form.get("volume")),
          issueNumber: Number(form.get("issueNumber")),
          year: Number(form.get("year")),
          title: form.get("title"),
          publicationDate: form.get("publicationDate") || undefined,
          coverUrl: form.get("coverUrl") || null,
        }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create issue");
    }
  }
  const field = "mt-1 w-full rounded border px-3 py-2";
  return (
    <form className="mt-8 max-w-xl space-y-3 rounded border bg-white p-5" onSubmit={onSubmit}>
      <h2 className="font-serif text-xl">Create issue</h2>
      <select className={field} name="journalId">
        {journals.map((journal) => (
          <option key={journal.id} value={journal.id}>
            {journal.name}
          </option>
        ))}
      </select>
      <input className={field} name="title" required placeholder="Issue title" />
      <input className={field} name="volume" type="number" required placeholder="Volume" />
      <input className={field} name="issueNumber" type="number" required placeholder="Issue number" />
      <input className={field} name="year" type="number" required placeholder="Year" />
      <input className={field} name="publicationDate" type="date" placeholder="Publication date" />
      <input className={field} name="coverUrl" placeholder="Cover image URL" />
      {error ? <p className="text-sm text-crimson-700">{error}</p> : null}
      <button className="rounded bg-ink-950 px-4 py-2 text-white" type="submit">
        Create
      </button>
    </form>
  );
}
