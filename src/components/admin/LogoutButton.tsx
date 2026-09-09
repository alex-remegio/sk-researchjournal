"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="mt-4 rounded px-3 py-2 text-left text-sm text-ink-300 hover:bg-ink-800"
      type="button"
      onClick={async () => {
        try {
          await signOut({ redirect: false });
        } catch {
          // Auth.js cookie may already be absent
        }
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
