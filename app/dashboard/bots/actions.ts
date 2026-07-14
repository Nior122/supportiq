/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Server actions for bot CRUD. These are the entry points for all bot-related
 * form submissions and mutations. They handle:
 *  - Input validation via Zod
 *  - Auth resolution via requireWorkspaceId()
 *  - Delegating to the service layer
 *  - Returning typed ActionResponse<T>
 *
 * The pattern: parse input → check auth → call service → return result.
 * Never touch Prisma directly from here — always go through `services/bot.ts`.
 */
"use server";

import { z } from "zod";
import { requireWorkspaceId } from "@/lib/auth/session";
import { createBot, updateBot, deleteBot } from "@/services/bot";
import type { ActionResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const createBotSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  modelProvider: z.enum(["OPENAI", "ANTHROPIC", "GROQ"]).default("GROQ"),
  modelId: z.string().default("llama-3.3-70b-versatile"),
  systemPrompt: z.string().optional(),
  persona: z.string().optional(),
  language: z.string().default("en"),
  greeting: z.string().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateBotSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters")
    .optional(),
  modelProvider: z.enum(["OPENAI", "ANTHROPIC", "GROQ"]).optional(),
  modelId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  systemPrompt: z.string().optional(),
  persona: z.string().optional(),
  language: z.string().optional(),
  greeting: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  rateLimitPerMinute: z.number().min(0).max(1000).optional(),
});

// Appearance-related fields on the Bot model. Kept as a separate schema from
// updateBotSchema so the appearance form can submit a focused payload and
// validation messages map cleanly to appearance form fields. `hexColor` accepts
// 3- or 6-digit hex with an optional leading #.
const hexColor = z
  .string()
  .regex(/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/, "Use a hex color, e.g. #6366f1")
  .optional();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateAppearanceSchema = z.object({
  greeting: z.string().optional(),
  welcomeMessage: z.string().optional(),
  quickReplies: z.array(z.string()).optional(),
  avatarUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
  logoUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
  appearance: z
    .object({
      primaryColor: hexColor,
      accentColor: hexColor,
      borderRadius: z.number().min(0).max(32).optional(),
      position: z.enum(["bottom-right", "bottom-left"]).optional(),
      size: z.enum(["small", "medium", "large"]).optional(),
    })
    .optional(),
});

export async function createBotAction(
  formData: FormData,
): Promise<ActionResponse<{ publicId: string }>> {
  try {
    const workspaceId = await requireWorkspaceId();

    // FormData.get() returns null for missing keys; Zod .optional()/.default() only
    // handle undefined, so convert null → undefined to avoid spurious validation errors.
    const get = (key: string) => formData.get(key) ?? undefined;

    const parsed = createBotSchema.safeParse({
      name: get("name"),
      modelProvider: get("modelProvider"),
      modelId: get("modelId"),
      systemPrompt: get("systemPrompt"),
      persona: get("persona"),
      language: get("language"),
      greeting: get("greeting"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed",
        fieldErrors: Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.join(", ") ?? ""]),
        ),
      };
    }

    const bot = await createBot(workspaceId, parsed.data);

    return { ok: true, data: { publicId: bot.publicId } };
  } catch (err) {
    console.error("createBotAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create bot",
    };
  }
}

export async function updateBotAction(
  publicId: string,
  data: z.infer<typeof updateBotSchema>,
): Promise<ActionResponse<void>> {
  try {
    const workspaceId = await requireWorkspaceId();
    await updateBot(workspaceId, publicId, data);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateBotAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update bot",
    };
  }
}

/**
 * Update only the appearance-facing fields of a bot (greeting, welcome message,
 * quick replies, avatar/logo URLs, and the `appearance` JSON). Submitted by the
 * Customize page. Falls back to the existing `updateBot` service so it reuses
 * the same ownership check and Neon-friendly scalar-update path.
 */
export async function updateAppearanceAction(
  publicId: string,
  data: z.infer<typeof updateAppearanceSchema>,
): Promise<ActionResponse<void>> {
  try {
    const parsed = updateAppearanceSchema.safeParse(data);
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

    const workspaceId = await requireWorkspaceId();
    const d = parsed.data;

    // Normalize optional URL inputs: empty string → undefined so we don't store "".
    const avatarUrl = d.avatarUrl === "" ? undefined : d.avatarUrl;
    const logoUrl = d.logoUrl === "" ? undefined : d.logoUrl;

    // Filter to only the keys that were actually provided so we don't wipe
    // fields the form didn't touch (undefined values are skipped by Prisma).
    const update: Record<string, unknown> = {};
    if (d.greeting !== undefined) update.greeting = d.greeting || null;
    if (d.welcomeMessage !== undefined)
      update.welcomeMessage = d.welcomeMessage || null;
    if (d.quickReplies !== undefined) update.quickReplies = d.quickReplies;
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl || null;
    if (logoUrl !== undefined) update.logoUrl = logoUrl || null;
    if (d.appearance !== undefined)
      update.appearance = d.appearance as Prisma.InputJsonValue;

    await updateBot(
      workspaceId,
      publicId,
      update as Prisma.BotUpdateInput,
    );
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateAppearanceAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update appearance",
    };
  }
}

export async function deleteBotAction(
  publicId: string,
): Promise<ActionResponse<void>> {
  try {
    const workspaceId = await requireWorkspaceId();
    await deleteBot(workspaceId, publicId);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("deleteBotAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete bot",
    };
  }
}
