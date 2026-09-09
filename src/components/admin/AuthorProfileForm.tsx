"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export function AuthorProfileForm({
  author,
}: {
  author: {
    id: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    email: string;
    affiliation: string;
    country: string;
    orcid?: string | null;
    biography?: string | null;
  } | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const field = "mt-1 w-full rounded border px-3 py-2";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      firstName: form.get("firstName"),
      middleName: form.get("middleName") || null,
      lastName: form.get("lastName"),
      email: form.get("email"),
      affiliation: form.get("affiliation"),
      country: form.get("country"),
      orcid: form.get("orcid") || null,
      biography: form.get("biography") || null,
    };
    setError(null);
    try {
      await fetch("/api/auth/csrf");
      if (author) {
        await api(`/api/authors/${author.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/api/authors", { method: "POST", body: JSON.stringify(body) });
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    }
  }

  return (
    <form className="mt-6 max-w-xl space-y-3 rounded border bg-white p-5" onSubmit={onSubmit}>
      <h2 className="font-serif text-xl">{author ? "Edit profile" : "Create author profile"}</h2>
      <label className="block text-sm">
        First name
        <input className={field} name="firstName" defaultValue={author?.firstName} required />
      </label>
      <label className="block text-sm">
        Middle name
        <input className={field} name="middleName" defaultValue={author?.middleName ?? ""} />
      </label>
      <label className="block text-sm">
        Last name
        <input className={field} name="lastName" defaultValue={author?.lastName} required />
      </label>
      <label className="block text-sm">
        Email
        <input className={field} name="email" type="email" defaultValue={author?.email} required />
      </label>
      <label className="block text-sm">
        Affiliation
        <input className={field} name="affiliation" defaultValue={author?.affiliation} required />
      </label>
      <label className="block text-sm">
        Country
        <input className={field} name="country" defaultValue={author?.country} required />
      </label>
      <label className="block text-sm">
        ORCID
        <input
          className={field}
          name="orcid"
          defaultValue={author?.orcid ?? ""}
          placeholder="0000-0000-0000-0000"
        />
      </label>
      <label className="block text-sm">
        Biography
        <textarea className={field} name="biography" rows={5} defaultValue={author?.biography ?? ""} />
      </label>
      {error ? <p className="text-sm text-crimson-700">{error}</p> : null}
      <button className="rounded bg-ink-950 px-4 py-2 text-white" type="submit">
        Save profile
      </button>
    </form>
  );
}
