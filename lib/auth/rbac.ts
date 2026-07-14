/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Centralizes all role-based access checks. A route or action calls
 * `requireRole(session, "ADMIN")` and gets either a resolved void or a thrown
 * ForbiddenError. Keeping role logic in one file means the org-role perms matrix is
 * a single readable table, audited in code review, instead of scattered `if`s.
 *
 * ROLE MATRIX (Clerk org roles → our perms):
 *   ┌────────┬──────┬─────────┬────────┬───────────┬──────────┬────────┐
 *   │ action │OWNER │ ADMIN   │ MEMBER │ anonymous │          │        │
 *   ├────────┼──────┼─────────┼────────┼───────────┼──────────┼────────┤
 *   │ read bot/docs/conversations/leads  ✔ all    ✔ all     ✔ all     ✗      │
 *   │ create/update bot                                   ✔        ✔   ✗        │
 *   │ delete bot & workspace                              ✔        ✗   ✗        │
 *   │ invite/manage members                               ✔        ✔   ✗        │
 *   │ manage billing & API keys                           ✔        ✔   ✗        │
 *   └──────────────────────────────────────────────────────────────────────────┘
 */
import type { SessionContext } from "@/types";
import { clerkRoleToDbRole, ForbiddenError, UnauthenticatedError } from "./session";
import type { Role } from "@/types";

export type Permission =
  | "read"
  | "write"
  | "delete"
  | "manage-members"
  | "manage-billing"
  | "manage-api-keys";

const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

const PERMISSION_MIN_ROLE: Record<Permission, Role> = {
  read: "MEMBER",
  write: "ADMIN",
  delete: "OWNER",
  "manage-members": "ADMIN",
  "manage-billing": "ADMIN",
  "manage-api-keys": "ADMIN",
};

export function roleSatisfies(role: Role, min: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

/** Maps session → DB role (or OWNER fallback for the creating user). */
export function roleFromSession(session: SessionContext | null): Role {
  if (!session) return "MEMBER";
  return clerkRoleToDbRole(session.orgRole);
}

/** Throw ForbiddenError unless the session has at least the minimum role for `perm`. */
export function assertPermission(
  session: SessionContext | null,
  perm: Permission,
): void {
  if (!session?.workspaceId) throw new UnauthenticatedError();
  const min = PERMISSION_MIN_ROLE[perm];
  if (!roleSatisfies(roleFromSession(session), min)) {
    throw new ForbiddenError(`This action requires the ${min} role.`);
  }
}

/** Non-throwing variant for branch-y code. */
export function can(
  session: SessionContext | null,
  perm: Permission,
): session is SessionContext {
  if (!session?.workspaceId) return false;
  return roleSatisfies(roleFromSession(session), PERMISSION_MIN_ROLE[perm]);
}
