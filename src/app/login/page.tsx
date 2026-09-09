import { Suspense } from "react";
import LoginPage from "./LoginForm";

export default function LoginRoute() {
  return (
    <Suspense fallback={<p className="p-8">Loading login…</p>}>
      <LoginPage />
    </Suspense>
  );
}
