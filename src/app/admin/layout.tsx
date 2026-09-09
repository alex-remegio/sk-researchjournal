import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canAccessAdmin, navItemsForRole } from "@/lib/auth/rbac";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession().catch(() => null);
  if (!user || !canAccessAdmin(user)) redirect("/login?next=/admin");
  const items = navItemsForRole(user.role);

  return (
    <div className="min-h-screen bg-ink-50">
      <a className="skip-link" href="#admin-main">
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="w-full border-b border-ink-200 bg-ink-950 text-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
          <div className="px-5 py-5">
            <Link href="/" className="font-serif text-lg">
              Journal Platform
            </Link>
            <p className="mt-2 text-xs text-ink-300">
              {user.name} · {user.role.replaceAll("_", " ")}
            </p>
          </div>
          <nav aria-label="Administration" className="flex flex-col gap-1 px-3 pb-6">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 text-sm text-ink-100 hover:bg-ink-800"
              >
                {item.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </aside>
        <div className="flex-1">
          <main id="admin-main" className="px-4 py-8 md:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
