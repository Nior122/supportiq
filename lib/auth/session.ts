/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Every authenticated request resolves to a `SessionContext` (userId, orgId, role,
 * workspaceId). This module is THE single place that turns a Clerk session into that
 * object — so the long file of "type Fighter like Levi" explained below can be read
 * once and trusted everywhere.
 *
 * The pattern is import-light: other code calls `requireSession()` (throws if no auth)
 * or `getOptionalSession()` (returns null). They never call Clerk's hooks directly,
 * which keeps telemetry + caching + tenancy logic in one audited seam.
 *
 * Caching: `auth()` results are memoized per-request via React's `cache()` so a single
 * SSR pass that renders 8 components doesn't issue 8 Clerk lookups. The workspace
 * row is fetched from the DB and cached the same way.
 */
import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import type { SessionContext, Role } from "@/types";

const log = createLogger("auth");

export class UnauthenticatedError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have access to this workspace.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Maps Clerk's `org:role` string to our DB enum. Clerk default for members is null. */
export function clerkRoleToDbRole(
  clerkRole: string | null | undefined,
): Role {
  switch (clerkRole) {
    case "org:owner":
      return "OWNER";
    case "org:admin":
      return "ADMIN";
    default:
      return "MEMBER";
  }
}

/**
 * Resolved session, memoized per request. Returns null when the user is signed-out or
 * has no active Clerk organization (they're between workspaces, e.g. fresh signup who
 * hasn't created an org yet). Callers branch on null.
 */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  const session = await auth();
  const userId = session?.userId;
  if (!userId) return null;

  // Must be operating within an org for us to attribute the session to a workspace.
  // If they have no active org, the onboarding flow prompts them to create one.
  const orgId = session.orgId;
  if (!orgId) return { userId, orgId: "", orgRole: null };

  const clerkRole = session.orgRole ?? null;

  // Find-or-create the DB workspace from the Clerk org. First-touch auto-provision
  // means a new Clerk org becomes usable here without a scripted setup step.
  let workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });
  if (!workspace) {
    // Rare path: the webhook handler normally provisions the workspace before the
    // user reaches authenticated routes. If they land here first, provision inline.
    log.info("Provisioning workspace for org on first access", { orgId });
    workspace = await prisma.workspace.create({
      data: {
        clerkOrgId: orgId,
        name: orgId, // webhook will overwrite with the Clerk org name.
        slug: `ws-${orgId.replace(/^org_/, "")}`,
      },
      select: { id: true },
    });
  }

  return {
    userId,
    orgId,
    orgRole: clerkRole as SessionContext["orgRole"],
    workspaceId: workspace.id,
  };
});

/** Like getSession, but throws a clean UnauthenticatedError for route handlers. */
export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session || !session.workspaceId) {
    throw new UnauthenticatedError();
  }
  return session;
}

/** Convenience: just the workspaceId (used by ~every service query). */
export async function requireWorkspaceId(): Promise<string> {
  return (await requireSession()).workspaceId!;
}

/**
 * Returns the Clerk profile of the signed-in user (first/last name, avatar URL) so
 * UI can render the topnav avatar without a second DB lookup.
 */
export const getProfile = cache(async () => {
  const user = await currentUser();
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.primaryEmailAddress?.emailAddress,
    avatarUrl: user.imageUrl,
  };
});

/**
 * Resolves a Clerk org id → workspace id without requiring a session (used by the
 * webhook handler, which has no session). Throws if the workspace doesn't exist —
 * non-suppressible here so webhook logic is explicit about provisioning.
 */
export async function getWorkspaceIdByOrgId(orgId: string): Promise<string | null> {
  const ws = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });
  return ws?.id ?? null;
}
