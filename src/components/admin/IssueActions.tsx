"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export function IssueActions({
  issueId,
  status,
  canApprove,
}: {
  issueId: string;
  status: string;
  canApprove: boolean;
}) {
  const router = useRouter();
  if (!canApprove || status === "PUBLISHED") return null;
  return (
    <button
      className="rounded border px-3 py-1 text-sm"
      type="button"
      onClick={async () => {
        await fetch("/api/auth/csrf");
        await api(`/api/issues/${issueId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "PUBLISHED" }),
        });
        router.refresh();
      }}
    >
      Approve issue
    </button>
  );
}
