import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canAccessIssuesAdmin, canApproveIssue, canManageIssues } from "@/lib/auth/rbac";
import { IssueAdminForm } from "@/components/admin/IssueAdminForm";
import { IssueActions } from "@/components/admin/IssueActions";
import { IssueCover } from "@/components/public/IssueCover";

export default async function AdminIssuesPage() {
  const user = await requireSession();
  if (!canAccessIssuesAdmin(user)) redirect("/admin");
  const issues = await prisma.issue.findMany({
    where: { deletedAt: null },
    include: { journal: true },
    orderBy: [{ year: "desc" }, { volume: "desc" }],
  });
  const journals = await prisma.journal.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });
  const manageable = journals.filter((journal) => canManageIssues(user, journal.id));
  return (
    <div>
      <h1 className="font-serif text-3xl">Publication schedule</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Managing Editors maintain the issue calendar. The Editor-in-Chief approves issues before they
        are published.
      </p>
      <ul className="mt-6 divide-y rounded border bg-white">
        {issues.map((issue) => (
          <li key={issue.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <IssueCover src={issue.coverUrl} title={issue.title} className="h-14 w-10 object-cover" />
              <p>
                {issue.journal.abbreviation}: Vol. {issue.volume} No. {issue.issueNumber} ({issue.year}) —{" "}
                {issue.status}
                {issue.publicationDate
                  ? ` · ${issue.publicationDate.toISOString().slice(0, 10)}`
                  : ""}
              </p>
            </div>
            <IssueActions
              issueId={issue.id}
              status={issue.status}
              canApprove={canApproveIssue(user, issue.journalId)}
            />
          </li>
        ))}
      </ul>
      {manageable.length ? <IssueAdminForm journals={manageable} /> : null}
    </div>
  );
}
