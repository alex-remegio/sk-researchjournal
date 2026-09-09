import Link from "next/link";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { listMyReviewAssignments } from "@/lib/services/review";

export default async function MyReviewsPage() {
  const user = await requireSession();
  if (user.role !== Role.REVIEWER && user.role !== Role.SUPER_ADMIN && user.role !== Role.EDITOR_IN_CHIEF) {
    redirect("/admin");
  }
  const assignments = await listMyReviewAssignments(user.id);
  return (
    <div>
      <h1 className="font-serif text-3xl">EDAS reviews</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Reviewer work is handled through EDAS (submission, review, and decision). This list only
        shows invitations that also exist in the journal platform, typically in mock or manual EDAS
        mode.
      </p>
      {user.role === Role.REVIEWER ? (
        <p className="mt-3 text-sm text-ink-600">
          Open the EDAS Paper ID on each assignment in the conference system to submit the referee
          report.
        </p>
      ) : null}
      <ul className="mt-6 divide-y rounded border bg-white">
        {assignments.map((assignment) => (
          <li key={assignment.id} className="p-4">
            <Link className="font-serif text-lg underline" href={`/admin/reviews/${assignment.id}`}>
              {assignment.article.title}
            </Link>
            <p className="text-sm text-ink-600">
              {assignment.article.journal.abbreviation} · {assignment.status}
              {assignment.article.edasPaperId ? ` · EDAS ${assignment.article.edasPaperId}` : " · no EDAS Paper ID"}
              {assignment.report ? ` · ${assignment.report.recommendation}` : ""}
            </p>
          </li>
        ))}
        {!assignments.length ? (
          <li className="p-4 text-ink-600">No EDAS-linked review invitations in this system.</li>
        ) : null}
      </ul>
    </div>
  );
}
