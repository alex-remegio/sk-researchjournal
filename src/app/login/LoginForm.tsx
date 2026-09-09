"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/client/api";
import { BRAND_SHORT } from "@/lib/branding";

export default function LoginForm({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      await fetch("/api/auth/csrf");
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await signIn("credentials", { email, password, redirect: false });
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      id="editorial-login"
      className={
        embedded
          ? "border border-ink-300 bg-white shadow-sm"
          : "mx-auto max-w-md border border-ink-300 bg-white shadow-sm"
      }
    >
      <div className="border-b border-ink-200 bg-ink-950 px-5 py-4 text-white">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-300">{BRAND_SHORT}</p>
        <h2 className="mt-1 font-serif text-2xl tracking-normal">Editorial sign in</h2>
        <p className="mt-2 text-sm text-ink-300">
          Access the editorial office for submissions, peer review, and publication workflows.
        </p>
      </div>
      <form className="space-y-4 px-5 py-5" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="username" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1"
          />
        </div>
        {error ? <p className="text-sm text-crimson-700">{error}</p> : null}
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-xs text-ink-500">
          Readers can{" "}
          <Link className="underline" href="/">
            continue browsing
          </Link>{" "}
          without an account.
        </p>
      </form>
    </div>
  );
}
