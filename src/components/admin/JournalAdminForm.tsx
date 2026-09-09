"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/client/api";
import { useRouter } from "next/navigation";

export function JournalAdminForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await fetch("/api/auth/csrf");
      await api("/api/journals", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          abbreviation: form.get("abbreviation"),
          description: form.get("description"),
          publisher: form.get("publisher"),
          frequency: form.get("frequency"),
          websiteSlug: form.get("websiteSlug"),
          issnPrint: form.get("issnPrint") || null,
          issnOnline: form.get("issnOnline") || null,
        }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create journal");
    }
  }
  const field = "mt-1 w-full rounded border px-3 py-2";
  return (
    <form className="mt-8 max-w-xl space-y-3 rounded border bg-white p-5" onSubmit={onSubmit}>
      <h2 className="font-serif text-xl">Create journal</h2>
      <input className={field} name="name" required placeholder="Name" />
      <input className={field} name="abbreviation" required placeholder="Abbreviation" />
      <input className={field} name="websiteSlug" required placeholder="URL slug" />
      <input className={field} name="publisher" required placeholder="Publisher" />
      <input className={field} name="frequency" required placeholder="Frequency" />
      <input className={field} name="issnPrint" placeholder="ISSN print" />
      <input className={field} name="issnOnline" placeholder="ISSN online" />
      <textarea className={field} name="description" required placeholder="Description" rows={4} />
      {error ? <p className="text-sm text-crimson-700">{error}</p> : null}
      <button className="rounded bg-ink-950 px-4 py-2 text-white" type="submit">
        Create
      </button>
    </form>
  );
}
