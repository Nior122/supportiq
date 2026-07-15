/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Server actions for the Integrations page. Handles:
 *  - API key generation (crypto.randomBytes, HMAC hash, display key ONCE)
 *  - API key revocation (soft-delete via revokedAt timestamp)
 *  - Webhook CRUD (create, toggle active, delete)
 *
 * API keys are stored as HMAC hashes — the raw key is shown once at creation
 * and never stored. Webhooks store a shared secret for HMAC-SHA256 signing.
 */
"use server";

import { z } from "zod";
import crypto from "crypto";
import { requireWorkspaceId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/types";

// ── API Key Actions ──────────────────────────────────────────────────────────

const generateKeySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
});

/**
 * Generate a new API key. Returns the raw key ONCE — it is never stored.
 * The keyHash (HMAC-SHA256) is stored for verification.
 */
export async function generateApiKeyAction(
  formData: FormData,
): Promise<ActionResponse<{ rawKey: string; keyPrefix: string; id: string }>> {
  try {
    const workspaceId = await requireWorkspaceId();

    const name = formData.get("name") ?? undefined;
    const parsed = generateKeySchema.safeParse({ name });
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed",
        fieldErrors: Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
            k,
            v?.join(", ") ?? "",
          ]),
        ),
      };
    }

    // Generate a random API key: "sk_" + 48 hex chars
    const randomBytes = crypto.randomBytes(24);
    const rawKey = `sk_${randomBytes.toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 8);

    // Hash the key with HMAC-SHA256 for storage
    const hmac = crypto.createHmac("sha256", process.env.API_KEY_SECRET ?? "supportiq-default-secret");
    hmac.update(rawKey);
    const keyHash = hmac.digest("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        workspaceId,
        name: parsed.data.name,
        keyHash,
        keyPrefix,
      },
    });

    return {
      ok: true,
      data: { rawKey, keyPrefix: apiKey.keyPrefix, id: apiKey.id },
    };
  } catch (err) {
    console.error("generateApiKeyAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to generate API key",
    };
  }
}

/**
 * Revoke an API key (soft-delete). Sets revokedAt to now.
 */
export async function revokeApiKeyAction(
  keyId: string,
): Promise<ActionResponse<void>> {
  try {
    const workspaceId = await requireWorkspaceId();

    // Verify ownership before revoking
    const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
    if (!key || key.workspaceId !== workspaceId) {
      return { ok: false, error: "API key not found" };
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    return { ok: true, data: undefined };
  } catch (err) {
    console.error("revokeApiKeyAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to revoke API key",
    };
  }
}

// ── Webhook Actions ──────────────────────────────────────────────────────────

const createWebhookSchema = z.object({
  url: z.string().url("Enter a valid URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
});

/**
 * Create a new webhook endpoint. Generates a shared secret for HMAC-SHA256
 * signing of outgoing webhook payloads.
 */
export async function createWebhookAction(
  formData: FormData,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const workspaceId = await requireWorkspaceId();

    const url = formData.get("url") ?? undefined;
    const eventsRaw = formData.getAll("events");
    const events = eventsRaw.length > 0 ? eventsRaw.map(String) : undefined;

    const parsed = createWebhookSchema.safeParse({ url, events });
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed",
        fieldErrors: Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
            k,
            v?.join(", ") ?? "",
          ]),
        ),
      };
    }

    // Generate a shared secret for webhook signing
    const secret = crypto.randomBytes(32).toString("hex");

    const webhook = await prisma.webhookConfig.create({
      data: {
        workspaceId,
        url: parsed.data.url,
        events: parsed.data.events,
        secret,
      },
    });

    return { ok: true, data: { id: webhook.id } };
  } catch (err) {
    console.error("createWebhookAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create webhook",
    };
  }
}

/**
 * Toggle a webhook's active status.
 */
export async function toggleWebhookAction(
  webhookId: string,
): Promise<ActionResponse<void>> {
  try {
    const workspaceId = await requireWorkspaceId();

    const webhook = await prisma.webhookConfig.findUnique({
      where: { id: webhookId },
    });
    if (!webhook || webhook.workspaceId !== workspaceId) {
      return { ok: false, error: "Webhook not found" };
    }

    await prisma.webhookConfig.update({
      where: { id: webhookId },
      data: { active: !webhook.active },
    });

    return { ok: true, data: undefined };
  } catch (err) {
    console.error("toggleWebhookAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update webhook",
    };
  }
}

/**
 * Delete a webhook endpoint.
 */
export async function deleteWebhookAction(
  webhookId: string,
): Promise<ActionResponse<void>> {
  try {
    const workspaceId = await requireWorkspaceId();

    const webhook = await prisma.webhookConfig.findUnique({
      where: { id: webhookId },
    });
    if (!webhook || webhook.workspaceId !== workspaceId) {
      return { ok: false, error: "Webhook not found" };
    }

    await prisma.webhookConfig.delete({ where: { id: webhookId } });

    return { ok: true, data: undefined };
  } catch (err) {
    console.error("deleteWebhookAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete webhook",
    };
  }
}
