import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { canManageJournal, canManagePlatform } from "@/lib/auth/rbac";
import { IssueCover } from "@/components/public/IssueCover";
import { getJournalAdministration } from "@/lib/services/administration";
import { JournalAdministration } from "@/components/admin/JournalAdministration";

export default async function JournalRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession();
  if (!canManageJournal(user, id) && !canManagePlatform(user)) redirect("/admin/journals");
  const [journal, administration] = await Promise.all([
    prisma.journal.findFirst({
      where: { id, deletedAt: null },
      include: {
        issues: {
          where: { deletedAt: null },
          orderBy: [{ year: "desc" }, { volume: "desc" }, { issueNumber: "desc" }],
          include: {
            articles: {
              where: { deletedAt: null },
              orderBy: { firstPage: "asc" },
              include: {
                _count: { select: { authors: true, keywords: true, references: true, files: true, metrics: true } },
              },
            },
          },
        },
        editorialBoard: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
        announcements: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        categories: { where: { deletedAt: null }, orderBy: { name: "asc" } },
        settings: true,
      },
    }),
    getJournalAdministration(user, id),
  ]);
  if (!journal) notFound();
  return (
    <div>
      <JournalAdministration data={administration} />
      <p className="mt-6 text-sm">
        <Link className="underline" href={`/journals/${journal.websiteSlug}`}>
          Open public site
        </Link>
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Issues</h2>
        <ul className="mt-4 space-y-6">
          {journal.issues.map((issue) => (
            <li key={issue.id} className="rounded border bg-white p-4">
              <div className="flex flex-wrap gap-4">
                <IssueCover src={issue.coverUrl} title={issue.title} />
                <div>
                  <p className="font-medium">
                    Vol. {issue.volume} No. {issue.issueNumber} ({issue.year}) — {issue.title}
                  </p>
                  <p className="text-sm text-ink-600">
                    {issue.status} · {issue.articles.length} articles
                    {issue.coverUrl ? " · cover" : ""}
                  </p>
                  <p className="mt-1 text-sm">
                    <Link className="underline" href={`/journals/${journal.websiteSlug}/issues/${issue.id}`}>
                      Public issue
                    </Link>
                    {" · "}
                    <Link className="underline" href="/admin/issues">
                      Schedule
                    </Link>
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {issue.articles.map((article) => (
                      <li key={article.id}>
                        <Link className="underline" href={`/admin/articles/${article.id}/wizard`}>
                          {article.title}
                        </Link>
                        <span className="text-ink-500">
                          {" "}
                          · authors {article._count.authors} · keywords {article._count.keywords} ·
                          references {article._count.references} · files {article._count.files} ·
                          metrics {article._count.metrics}
                        </span>
                      </li>
                    ))}
                    {!issue.articles.length ? <li className="text-ink-500">No articles in this issue.</li> : null}
                  </ul>
                </div>
              </div>
            </li>
          ))}
          {!journal.issues.length ? <li className="text-ink-600">No issues yet.</li> : null}
        </ul>
        <p className="mt-3 text-sm">
          <Link className="underline" href="/admin/issues">
            Publication schedule
          </Link>
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <h2 className="font-serif text-xl">Editorial board</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {journal.editorialBoard.map((member) => (
              <li key={member.id}>
                {member.name} — {member.title}
              </li>
            ))}
            {!journal.editorialBoard.length ? <li className="text-ink-500">No board members.</li> : null}
          </ul>
          <Link className="mt-3 inline-block text-sm underline" href="/admin/editorial-board">
            Manage board
          </Link>
        </div>
        <div className="rounded border bg-white p-4">
          <h2 className="font-serif text-xl">Announcements</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {journal.announcements.slice(0, 6).map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
            {!journal.announcements.length ? <li className="text-ink-500">No announcements.</li> : null}
          </ul>
          <Link className="mt-3 inline-block text-sm underline" href="/admin/announcements">
            Manage announcements
          </Link>
        </div>
        <div className="rounded border bg-white p-4">
          <h2 className="font-serif text-xl">Categories</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {journal.categories.map((category) => (
              <li key={category.id}>{category.name}</li>
            ))}
            {!journal.categories.length ? <li className="text-ink-500">No categories.</li> : null}
          </ul>
          <Link className="mt-3 inline-block text-sm underline" href="/admin/categories">
            Manage categories
          </Link>
        </div>
        <div className="rounded border bg-white p-4">
          <h2 className="font-serif text-xl">Settings</h2>
          <p className="mt-3 text-sm text-ink-600">{journal.settings.length} stored keys</p>
          <Link className="mt-3 inline-block text-sm underline" href="/admin/settings">
            Journal settings
          </Link>
        </div>
      </section>
    </div>
  );
}
