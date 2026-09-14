"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BRAND_LOGO, BRAND_NAME, BRAND_NAV, BRAND_SHORT } from "@/lib/branding";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Link href="/" className="flex shrink-0 items-center gap-3" title={BRAND_NAME}>
          <Image
            src={BRAND_LOGO}
            alt={BRAND_SHORT}
            width={280}
            height={77}
            className="h-11 w-auto md:h-14"
            priority
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {BRAND_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-navy-700 transition hover:text-forest-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded border border-ink-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-700 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-ink-100 bg-white px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {BRAND_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-2 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-navy-700"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
