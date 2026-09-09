import Link from "next/link";
import { SearchBar } from "@/components/public/SearchBar";
import { BRAND_NAME, BRAND_SHORT } from "@/lib/branding";

/** Prefer env override when set; branding.ts is the safe client default. */
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || process.env.APP_NAME || BRAND_NAME;

export function SiteHeader() {
  return (
    <header className="border-b border-ink-200 bg-ink-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:gap-6">
        <Link
          href="/"
          className="min-w-0 shrink font-serif tracking-tight"
          title={APP_NAME}
        >
          <span className="block text-xl md:hidden">{BRAND_SHORT}</span>
          <span className="hidden text-base leading-snug md:block lg:text-lg">{APP_NAME}</span>
        </Link>
        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <SearchBar compact />
        </div>
        <nav aria-label="Primary" className="flex shrink-0 flex-wrap items-center gap-3 text-sm md:gap-4">
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
        <p>
          © {new Date().getFullYear()} {APP_NAME}. Open scholarly publishing.
        </p>
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
