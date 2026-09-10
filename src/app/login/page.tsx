import Link from "next/link";
import { Suspense } from "react";
import { PublicShell } from "@/components/public/Shell";
import {
  HomeCatalogSections,
  HomeHero,
  loadHomeCatalog,
} from "@/components/public/HomeContent";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Editorial sign in",
};

export default async function LoginRoute() {
  const result = await loadHomeCatalog();

  return (
    <PublicShell>
      {/* IEEE-style: stay on the journal home while signing into editorial services */}
      <section className="border border-ink-200 bg-gradient-to-br from-ink-50 via-white to-crimson-50/40 px-4 py-8 md:px-8 md:py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,22rem)]">
          <div>
            <HomeHero compact />
            <ul className="mt-8 grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
              <li className="border border-ink-200 bg-white/80 px-4 py-3">
                Browse published articles and current issues without signing in.
              </li>
              <li className="border border-ink-200 bg-white/80 px-4 py-3">
                Editorial accounts manage peer review, acceptance, and publication.
              </li>
              <li className="border border-ink-200 bg-white/80 px-4 py-3">
                Double-blind review: author and reviewer identities remain concealed from each other.
              </li>
              <li className="border border-ink-200 bg-white/80 px-4 py-3">
                Need help? Return to the{" "}
                <Link className="underline" href="/">
                  journal homepage
                </Link>
                .
              </li>
            </ul>
          </div>
          <Suspense
            fallback={
              <div className="border border-ink-300 bg-white p-8 text-sm text-ink-600">
                Loading sign-in…
              </div>
            }
          >
            <LoginForm embedded />
          </Suspense>
        </div>
      </section>

      {result.ok ? (
        <HomeCatalogSections journals={result.data.journals} articles={result.data.articles} />
      ) : (
        <p className="mt-10 text-sm text-ink-600">{result.message}</p>
      )}
    </PublicShell>
  );
}
