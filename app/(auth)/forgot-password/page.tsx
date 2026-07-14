"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Forgot-password flow. Clerk handles this inside the <SignIn> component — there
 * is no standalone <ForgotPassword> in Clerk v6. We show <SignIn> here and let
 * the user click "Forgot password?" within the form. The URL path is configurable
 * (see env NEXT_PUBLIC_CLERK_SIGN_IN_URL). The shell mirrors sign-in/up so all
 * auth pages feel like one product.
 */
import { SignIn } from "@clerk/nextjs";
import { AuthCardShell } from "@/components/auth/auth-card-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthCardShell
      title="Reset your password"
      subtitle="We'll send you a link to reset your password"
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
