import Link from "next/link";
import { env } from "@/lib/env";
import { SearchBar } from "@/components/public/SearchBar";

export function SiteHeader() {
  return (
    <header className="border-b border-ink-200 bg-ink-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="shrink-0 font-serif text-xl tracking-tight">
          {env.APP_NAME}
        </Link>
        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <SearchBar compact />
        </div>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-4 text-sm">
          <Link className="hover:text-ink-200" href="/journals">
            Journals
          </Link>
          <Link className="hover:text-ink-200" href="/search">
            Search
          </Link>
          <Link className="hover:text-ink-200" href="/login">
            Editorial login
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-600 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} {env.APP_NAME}. Open scholarly publishing.</p>
        <p>
          <Link className="underline" href="/robots.txt">
            Robots
          </Link>
          {" · "}
          <Link className="underline" href="/sitemap.xml">
            Sitemap
          </Link>
        </p>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
