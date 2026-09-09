import Link from "next/link";
import { PublicShell } from "@/components/public/Shell";

export default function NotFound() {
  return (
    <PublicShell>
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="mt-4">
        <Link className="underline" href="/">
          Return home
        </Link>
      </p>
    </PublicShell>
  );
}
