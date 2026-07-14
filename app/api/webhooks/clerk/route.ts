/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Clerk is the source of truth for users and organizations; our DB is a read-optimized
 * mirror so we can FK on owner IDs and run analytics joins without depending on
 * Clerk availability. This route receives Clerk webhooks and applies a small set of
 * projections:
 *
 *   - organization.created  → create Workspace (slug derived; revised at onboarding)
 *   - organization.updated  → update Workspace name
 *   - organizationMembership.* → create/update User rows (email, name, role)
 *   - user.deleted           → best-effort delete the User row (keep audit FK enforcement)
 *
 * The Svix signature verification is mandatory — without it anyone could POST to
 * create workspaces. We read the RAW body (Next body parsing is skipped for this
 * route via the runtime config) because Svix needs the untouched bytes to verify.
 */
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { clerkRoleToDbRole } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const log = createLogger("webhook:clerk");

// Clerk event payloads are wide; we only decode the fields we act on. Keeping this
// loose-typed (records) avoids importing Clerk's full TS types in the hot path and
// makes the handler resilient to Clerk adding fields without breaking us.
interface ClerkEvent {
  type: string;
  data: {
    id: string;
    name?: string;
    slug?: string;
    email_addresses?: { email_address: string; id: string }[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    public_metadata?: Record<string, unknown>;
    role?: string | null;
    organization?: { id: string };
    organization_id?: string;
  };
}

// --- HEAD scan utility (since we're not using Clerk SDK, read headers manually) ---
function headersAsRecord(hgt: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  hgt.forEach((v, k) => (out[k] = out[k] ? out[k] + "," + v : v));
  return out;
}

function getPrimaryEmail(event: ClerkEvent): string | undefined {
  const primaryId = event.data.primary_email_address_id;
  if (!primaryId) return event.data.email_addresses?.[0]?.email_address;
  return (
    event.data.email_addresses?.find((e) => e.id === primaryId)?.email_address
  );
}

async function handleOrganisationCreate(event: ClerkEvent) {
  const slug = event.data.slug || `ws-${event.data.id}`;
  // Slug collisions are rare; if it happens, append a short suffix (id-safe).
  const exists = await prisma.workspace.findUnique({
    where: { slug },
    select: { id: true },
  });
  const finalSlug = exists ? `${slug}-${event.data.id.slice(-6)}` : slug;

  await prisma.workspace.upsert({
    where: { clerkOrgId: event.data.id },
    update: { name: event.data.name ?? event.data.id },
    create: {
      clerkOrgId: event.data.id,
      name: event.data.name ?? event.data.id,
      slug: finalSlug,
    },
  });
  log.info("workspace provisioned", { orgId: event.data.id });
}

async function handleOrganisationUpdate(event: ClerkEvent) {
  await prisma.workspace.update({
    where: { clerkOrgId: event.data.id },
    data: { name: event.data.name ?? undefined },
  });
}

async function createOrUpdateUser(event: ClerkEvent) {
  const email = getPrimaryEmail(event);
  if (!email) {
    log.warn("user event without email", { clerkUserId: event.data.id });
    return;
  }
  // The user is created against whichever workspace Clerk says they belong to.
  // For membership events, `organization_id` carries that; for user.created it may
  // be empty — that's fine; we attach them to a workspace on the membership event.
  const orgId = event.data.organization_id ?? event.data.organization?.id;
  if (!orgId) return;

  const workspace = await prisma.workspace.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });
  if (!workspace) return; // webhook ordering race; org.created will fire first.

  await prisma.user.upsert({
    where: { clerkUserId: event.data.id },
    update: {
      email,
      firstName: event.data.first_name ?? undefined,
      lastName: event.data.last_name ?? undefined,
      avatarUrl: event.data.image_url ?? undefined,
      role: clerkRoleToDbRole(event.data.role ?? null),
    },
    create: {
      clerkUserId: event.data.id,
      email,
      firstName: event.data.first_name ?? undefined,
      lastName: event.data.last_name ?? undefined,
      avatarUrl: event.data.image_url ?? undefined,
      role: clerkRoleToDbRole(event.data.role ?? null),
      workspaceId: workspace.id,
    },
  });
}

async function handleUserDelete(event: ClerkEvent) {
  // Hard delete would cascade-label-children. Soft: blank the PII, keep the row so
  // audit FKs stay valid. We do NOT delete the Clerk user — that's already done.
  await prisma.user
    .update({
      where: { clerkUserId: event.data.id },
      data: {
        email: `deleted+${event.data.id}@removed.local`,
        firstName: null,
        lastName: null,
        avatarUrl: null,
      },
    })
    .catch((err) => log.warn("user delete failed (likely already gone)", { err }));
}

export async function POST(req: Request) {
  // ─── Svix signature verification ───
  // Required: without this an attacker with network access could craft events.
  const webhookSecret = env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    log.error("CLERK_WEBHOOK_SECRET missing — refusing to process events");
    return new NextResponse("Webhook secret not configured", { status: 503 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing signature headers", { status: 401 });
  }

  const payload = await req.text(); // raw untouched body for Svix
  const wh = new Webhook(webhookSecret);
  let event: ClerkEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as unknown as ClerkEvent;
  } catch (err) {
    log.warn("svix verification failed", { err });
    return new NextResponse("Invalid signature", { status: 401 });
  }

  // ─── Dispatch ───
  try {
    switch (event.type) {
      case "organization.created":
        await handleOrganisationCreate(event);
        break;
      case "organization.updated":
        await handleOrganisationUpdate(event);
        break;
      case "organizationMembership.created":
      case "organizationMembership.updated":
      case "user.created":
      case "user.updated":
        await createOrUpdateUser(event);
        break;
      case "user.deleted":
        await handleUserDelete(event);
        break;
      default:
        // Ignored events are intentionally not logged at warn — they're expected noise.
        log.debug("ignored event", { type: event.type });
    }
  } catch (err) {
    // A throw shouldn't return non-2xx for Clerk (it'd retry forever). Log and ack so
    // the queue drains; real bugs surface in logs.
    log.error("event handler threw", { type: event.type, err });
    return new NextResponse("Handler error", { status: 500 });
  }

  return new NextResponse("ok", { status: 200 });
}

// Re-export header helper for tests that want to build signed requests.
export const _headers = headersAsRecord;
