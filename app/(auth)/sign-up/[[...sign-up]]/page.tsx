"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Sign-up entry. On successful signup, Clerk redirects to /onboarding (configured in
 * env `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`) where we prompt for the workspace name
 * + create the Clerk Organization. The shell + appearance config mirrors sign-in so
 * both flows feel like one product.
 */
import { SignUp } from "@clerk/nextjs";
import { AuthCardShell } from "@/components/auth/auth-card-shell";

export default function SignUpPage() {
  return (
    <AuthCardShell
      title="Create your account"
      subtitle="Start training your AI assistant in minutes"
    >
      <SignUp
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
