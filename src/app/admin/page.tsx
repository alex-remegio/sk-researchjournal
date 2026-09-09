import Link from "next/link";
import { Role } from "@prisma/client";
import { requireSession } from "@/lib/auth/session";
import { ROLE_DUTIES, navItemsForRole } from "@/lib/auth/rbac";
import { getJournalAdministration } from "@/lib/services/administration";
import { JournalAdministration } from "@/components/admin/JournalAdministration";

export default async function AdminDashboard() {
  const user = await requireSession();
  const duties = ROLE_DUTIES[user.role];
  const links = navItemsForRole(user.role).filter((item) => item.href !== "/admin");
  const editorial =
    user.role === Role.SUPER_ADMIN ||
    user.role === Role.EDITOR_IN_CHIEF ||
    user.role === Role.MANAGING_EDITOR ||
    user.role === Role.SECTION_EDITOR;
  const administration = editorial ? await getJournalAdministration(user) : null;

  return (
    <div>
      <p className="text-sm uppercase tracking-wide text-crimson-700">{user.role.replaceAll("_", " ")}</p>
      {administration ? (
        <div className="mt-4">
          <JournalAdministration data={administration} />
        </div>
      ) : (
        <>
          <h1 className="mt-2 font-serif text-3xl">Dashboard</h1>
          <p className="mt-2 text-ink-600">Signed in as {user.email}</p>
          <ul className="mt-8 max-w-xl space-y-2 text-ink-800">
            {duties.map((duty) => (
              <li key={duty}>{duty}</li>
            ))}
          </ul>
        </>
      )}
      {user.role === Role.READER ? null : (
        <p className="mt-8 flex flex-wrap gap-3">
          {links.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              className="rounded border border-ink-300 bg-white px-4 py-2 text-sm"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </p>
      )}
    </div>
  );
}
