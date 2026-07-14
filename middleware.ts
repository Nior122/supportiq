/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Next middleware runs on the EDGE before route resolution, BEFORE any Server Component
 * or DB query. We use it for the cheapest, highest-leverage auth gate: redirect
 * unauthenticated users away from `/dashboard/*` to sign-in, and reverse-redirect
 * signed-in users away from `/sign-in`/`/sign-up` back to their dashboard. Doing this
 * at the edge means an unauthenticated request never reaches a Server Component that
 * would otherwise fetch data — saving a DB round trip on every blocked request.
 *
 * Note: middleware stays LIGHT. It does not resolve workspaces or hit the DB. Heavy
 * authorization (RBAC, ownership) happens in server components/actions via lib/auth.
 * Keeping middleware side-effect-free also keeps it fast + cacheable.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// A route matcher is cheaper to reason about than imperative if-chains because the
// set of protected routes is data, not logic. Adding a new protected route = one line.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/playground(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard + sensitive APIs. `auth.protect()` short-circuits to the
  // Clerk-hosted sign-in route with a redirect-back, so we don't build that flow.
  // NOTE: in clerkMiddleware, `auth` IS the resolved auth object — do NOT call auth().
  if (isProtectedRoute(req)) {
    await auth.protect();
    return;
  }

  // Reverse-gate: signed-in users visiting auth-only routes are bounced to the app,
  // which is the friendly behavior (no "you're already signed in" dead-end pages).
  if (isAuthRoute(req)) {
    const authObj = await auth();
    if (authObj.userId) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return Response.redirect(url);
    }
  }
});

// WHAT WE DON'T match on:
// - /embed/* — public widget, gated by signed-token at the route handler instead.
// - /api/webhooks/* — verified by webhook signing secret, not session.
// - static assets / Next internals (handled by the negative-lookahead below).
//
// CRITICAL (Clerk Next.js 15): the matcher array MUST include:
//   1. `'/(api|trpc)(.*)'`        — so Clerk's auth runs on API/TRPC routes.
//   2. `'/__clerk/:path*'`        — Clerk's auto-proxy passthrough path.
//   3. a catch-all that EXCLUDES static assets and our signed-token public routes.
// The order matters: API/TRPC first, then the Clerk proxy path, then the negative-
// lookahead catch-all last.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|embed/.*\\.js|embed/widget).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
