import Image from "next/image";
import Link from "next/link";
import {
  BRAND_FULL,
  BRAND_HERO,
  BRAND_MOBILE_TAGLINE,
  BRAND_SHORT,
  BRAND_TAGLINE,
} from "@/lib/branding";

const CURRENT_HREF = "/journals/skrjet/current";
const SUBMISSIONS_HREF = "/journals/skrjet/for-authors";

type BrandHeroProps = {
  /** Full landing hero, or a shorter campus band for interior pages */
  variant?: "full" | "banner";
};

export function BrandHero({ variant = "full" }: BrandHeroProps) {
  const isBanner = variant === "banner";

  return (
    <section className="relative isolate overflow-hidden text-white">
      <Image
        src={BRAND_HERO}
        alt=""
        fill
        priority={!isBanner}
        className="object-cover object-[center_40%]"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-forest-900/80 via-forest-700/72 to-navy-900/78"
        aria-hidden
      />

      {isBanner ? (
        <div className="relative mx-auto flex min-h-[9rem] max-w-6xl flex-col justify-center px-4 py-8 md:min-h-[11rem] md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">{BRAND_SHORT}</p>
          <h1 className="mt-1 max-w-3xl text-lg font-bold uppercase leading-snug tracking-wide text-white md:text-2xl">
            {BRAND_FULL}
          </h1>
          <p className="mt-2 hidden max-w-2xl text-sm text-white/85 sm:block">{BRAND_TAGLINE}</p>
        </div>
      ) : (
        <>
          {/* Desktop / tablet */}
          <div className="relative mx-auto hidden min-h-[28rem] max-w-6xl flex-col justify-center px-4 py-16 md:flex md:min-h-[32rem] md:py-20">
            <h1 className="max-w-4xl text-3xl font-bold uppercase leading-tight tracking-wide text-white lg:text-4xl xl:text-[2.65rem] xl:leading-[1.15]">
              {BRAND_FULL}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">{BRAND_TAGLINE}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={CURRENT_HREF}
                className="inline-flex items-center justify-center bg-gold-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-navy-900 transition hover:bg-gold-400"
              >
                Current Issue
              </Link>
              <Link
                href={SUBMISSIONS_HREF}
                className="inline-flex items-center justify-center border border-white/90 bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
              >
                Submissions
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="relative flex min-h-[22rem] flex-col items-center justify-center px-6 py-14 text-center md:hidden">
            <p className="text-4xl font-bold tracking-wide text-white">{BRAND_SHORT}</p>
            <p className="mt-3 text-sm font-medium tracking-wide text-white/90">{BRAND_MOBILE_TAGLINE}</p>
            <Link
              href={CURRENT_HREF}
              className="mt-8 inline-flex items-center justify-center bg-gold-500 px-7 py-3 text-sm font-bold uppercase tracking-[0.1em] text-navy-900"
            >
              Current Issue
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
