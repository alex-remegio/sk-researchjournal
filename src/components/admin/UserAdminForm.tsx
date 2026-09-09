"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/client/api";
import { useRouter } from "next/navigation";

export function UserAdminForm({ journals }: { journals: { id: string; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    const sendInvite = data.get("sendInvite") === "on";
    try {
      await fetch("/api/auth/csrf");
      const created = await api<{
        user: { id: string; email: string; inviteSent?: boolean };
      }>("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          email,
          password: data.get("password"),
          role: data.get("role"),
          active: true,
          sendInvite,
        }),
      });
      if (data.get("journalId")) {
        await api("/api/users", {
          method: "PATCH",
          body: JSON.stringify({
            assignment: {
              userId: created.user.id,
              journalId: data.get("journalId"),
              role: data.get("role"),
            },
          }),
        });
      }
      setStatus(
        created.user.inviteSent
          ? `Account created. Login details were emailed to ${email}.`
          : `Account created for ${email}. No invite email was sent.`,
      );
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create user");
    }
  }

  const field = "mt-1 w-full rounded border px-3 py-2";
  return (
    <form className="mt-8 max-w-xl space-y-3 rounded border bg-white p-5" onSubmit={onSubmit}>
      <h2 className="font-serif text-xl">Create user</h2>
      <input className={field} name="name" required placeholder="Name" autoComplete="name" />
      <input className={field} name="email" type="email" required placeholder="Email" autoComplete="off" />
      <input
        className={field}
        name="password"
        type="password"
        required
        minLength={12}
        placeholder="Password (12+ chars, upper, lower, number)"
        autoComplete="new-password"
      />
      <p className="text-xs text-ink-600">
        Password must be at least 12 characters and include upper case, lower case, and a number. Reviewers receive
        this password by email when invite is enabled.
      </p>
      <select className={field} name="role" defaultValue="REVIEWER">
        {["EDITOR_IN_CHIEF", "MANAGING_EDITOR", "SECTION_EDITOR", "AUTHOR", "REVIEWER", "READER"].map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <select className={field} name="journalId">
        <option value="">No journal assignment</option>
        {journals.map((journal) => (
          <option key={journal.id} value={journal.id}>
            {journal.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-ink-800">
        <input name="sendInvite" type="checkbox" defaultChecked />
        Email login details to this address
      </label>
      {error ? <p className="text-sm text-crimson-700">{error}</p> : null}
      {status ? <p className="text-sm text-ink-700">{status}</p> : null}
      <button className="rounded bg-ink-950 px-4 py-2 text-white" type="submit">
        Create
      </button>
    </form>
  );
}
