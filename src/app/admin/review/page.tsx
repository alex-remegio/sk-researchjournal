import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { listEditorialQueue } from "@/lib/services/review";
import { canScreenManuscript } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { displayName } from "@/lib/services/authors";

export default async function EditorialReviewQueuePage() {
  const user = await requireSession();
  const journals = await prisma.journal.findMany({ where: { deletedAt: null } });
  const allowed = journals.some((journal) => canScreenManuscript(user, journal.id)) || user.role === "SUPER_ADMIN";
  if (!allowed) redirect("/admin");
  const queue = await listEditorialQueue(user);
  return (
    <div>
      <h1 className="font-serif text-3xl">Peer review</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Single-blind process: screen submissions, assign anonymous reviewers, then record the
        Editor-in-Chief decision.
      </p>
      <ul className="mt-6 divide-y rounded border bg-white">
        {queue.map((article) => (
          <li key={article.id} className="p-4">
            <Link className="font-serif text-lg underline" href={`/admin/review/${article.id}`}>
              {article.title}
            </Link>
            <p className="text-sm text-ink-600">
              {article.journal.abbreviation} · {article.status.replaceAll("_", " ")} ·{" "}
              {article.authors.map((link) => displayName(link.author)).join(", ")}
            </p>
          </li>
        ))}
        {!queue.length ? <li className="p-4 text-ink-600">No manuscripts are in review.</li> : null}
      </ul>
    </div>
  );
}
