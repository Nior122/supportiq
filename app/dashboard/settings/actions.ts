/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Server actions for workspace settings. Handles workspace name updates
 * and other settings mutations.
 */
"use server";

import { z } from "zod";
import { requireWorkspaceId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/types";

const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
});

export async function updateWorkspaceAction(
  workspaceId: string,
  data: z.infer<typeof updateWorkspaceSchema>,
): Promise<ActionResponse<void>> {
  try {
    const sessionWorkspaceId = await requireWorkspaceId();

    // Ensure the user can only update their own workspace
    if (workspaceId !== sessionWorkspaceId) {
      return { ok: false, error: "Unauthorized" };
    }

    const parsed = updateWorkspaceSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed",
        fieldErrors: Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.join(", ") ?? ""]),
        ),
      };
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: parsed.data.name },
    });

    return { ok: true, data: undefined };
  } catch (err) {
    console.error("updateWorkspaceAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update workspace",
    };
  }
}
