/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The dashboard layout wraps every page under `(dashboard)/` with the persistent
 * sidebar + top nav shell. This is a React Server Component — it renders the
 * `DashboardShell` client component which handles the interactive parts (mobile
 * sidebar toggle, theme toggle, user dropdown).
 *
 * Auth gating happens in `middleware.ts` (protect()) — by the time a request reaches
 * this layout, the user is guaranteed to be SIGNED IN. But Clerk's protect() only
 * checks authentication, not org membership. A signed-in user with no active Clerk
 * Organization has no workspace to attribute data to; child pages call requireSession()
 * which would throw UnauthenticatedError and show the dashboard error boundary. So we
 * resolve the session here once and redirect orgless users to /onboarding instead —
 * the only place org creation is allowed — before any dashboard page runs a query.
 *
 * The layout also provides `<title>` metadata for all dashboard pages via the
 * `title.template` in the root layout.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getSession() is cached per-request, so this is the SAME resolution the child
  // pages' requireSession() would do — no extra DB/Clerk round trip.
  const session = await getSession();

  // Signed-out users never reach here (middleware protect() already redirected).
  // A signed-in user with no org (fresh signup, or they left their only org) has no
  // workspaceId → send them to create one. Everything past this point can assume a
  // usable workspace on the session.
  if (!session?.workspaceId) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
