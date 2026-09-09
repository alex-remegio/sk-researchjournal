"use client";

import { api } from "@/lib/client/api";
import { useRouter } from "next/navigation";

export function SettingsForm({
  journal,
  settings,
}: {
  journal: { id: string; name: string };
  settings: Record<string, string>;
}) {
  const router = useRouter();
  async function save(key: string, value: string) {
    await fetch("/api/auth/csrf");
    await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ journalId: journal.id, key, value }),
    });
    router.refresh();
  }
  return (
    <div className="mt-6 max-w-xl space-y-4 rounded border bg-white p-5">
      <h2 className="font-serif text-xl">{journal.name}</h2>
      {Object.entries(settings).map(([key, value]) => (
        <label key={key} className="block text-sm">
          {key}
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            defaultValue={value}
            onBlur={(event) => {
              if (event.target.value !== value) void save(key, event.target.value);
            }}
          />
        </label>
      ))}
    </div>
  );
}
