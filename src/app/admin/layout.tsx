import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canAccessAdmin, navItemsForRole } from "@/lib/auth/rbac";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { BRAND_LOGO, BRAND_NAME, BRAND_SHORT } from "@/lib/branding";

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
        <aside className="w-full border-b border-ink-200 bg-white md:min-h-screen md:w-72 md:border-b-0 md:border-r md:border-ink-200">
          <div className="border-b border-ink-100 px-5 py-5">
            <Link href="/" className="block" title={BRAND_NAME}>
              <Image
                src={BRAND_LOGO}
                alt={BRAND_SHORT}
                width={220}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <p className="mt-3 text-xs text-ink-600">
              {user.name} · {user.role.replaceAll("_", " ")}
            </p>
          </div>
          <nav aria-label="Administration" className="flex flex-col gap-1 px-3 py-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 text-sm text-navy-700 hover:bg-ink-50 hover:text-forest-500"
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
