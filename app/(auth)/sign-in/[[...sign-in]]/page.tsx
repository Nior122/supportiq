"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Sign-in entry. Uses Clerk's `<SignIn />` in a route-group layout `(auth)` so the
 * auth pages share a dedicated shell (centered card on a branded gradient backdrop)
 * without polluting the marketing or dashboard layouts. The catch-all `[[...sign-in]]`
 * segment is required by Clerk for multi-step flows (MFA, SSO, verification) — those
 * internal steps are URL sub-paths the Clerk component routes virtually.
 */
import { SignIn } from "@clerk/nextjs";
import { AuthCardShell } from "@/components/auth/auth-card-shell";

export default function SignInPage() {
  return (
    <AuthCardShell
      title="Welcome back"
      subtitle="Sign in to your SupportIQ workspace"
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none border-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
          },
        }}
      />
    </AuthCardShell>
  );
}
