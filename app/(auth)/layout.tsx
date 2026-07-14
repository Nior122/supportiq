/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Auth pages (sign-in, sign-up, forgot-password) share a dedicated layout with no
 * sidebar or topnav. It contributes only per-page metadata + a wrapper centered on a
 * branded gradient backdrop; the actual visual shell lives in `AuthCardShell` per page
 * so Clerk's internal step routing (MFA, verification) can swap card content without
 * re-rendering the layout.
 *
 * NOTE: this layout MUST NOT render <html>/<body>. Route-group layouts nest inside the
 * root layout (app/layout.tsx) which already owns <html>/<body> + <Providers> (which
 * mounts ClerkProvider). Rendering them again here would produce nested <html> elements
 * and a second ClerkProvider. It only needs to center its children on the auth backdrop.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — SupportIQ",
  description: "Sign in to your SupportIQ workspace",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {children}
    </div>
  );
}
