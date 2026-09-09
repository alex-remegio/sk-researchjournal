import { Suspense } from "react";
import { PublicShell } from "@/components/public/Shell";
import LoginForm from "./LoginForm";

export default function LoginRoute() {
  return (
    <PublicShell>
      <Suspense fallback={<p>Loading login…</p>}>
        <LoginForm />
      </Suspense>
    </PublicShell>
  );
}
