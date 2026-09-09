"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/client/api";
import { useRouter } from "next/navigation";

export function SimpleCreateForm({
  endpoint,
  fields,
}: {
  endpoint: string;
  fields: { name: string; label: string; placeholder?: string; type?: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body: Record<string, string> = {};
    for (const field of fields) body[field.name] = String(form.get(field.name) ?? "");
    try {
      await fetch("/api/auth/csrf");
      await api(endpoint, { method: "POST", body: JSON.stringify(body) });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }
  return (
    <form className="mt-8 max-w-xl space-y-3 rounded border bg-white p-5" onSubmit={onSubmit}>
      {fields.map((field) => (
        <label key={field.name} className="block text-sm">
          {field.label}
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            name={field.name}
            placeholder={field.placeholder}
            type={field.type ?? "text"}
            required
          />
        </label>
      ))}
      {error ? <p className="text-sm text-crimson-700">{error}</p> : null}
      <button className="rounded bg-ink-950 px-4 py-2 text-white" type="submit">
        Create
      </button>
    </form>
  );
}
