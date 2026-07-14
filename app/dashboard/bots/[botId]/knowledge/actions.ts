/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Server actions for knowledge base document management. Handles:
 *  - File uploads (PDF, TXT, CSV) via FormData
 *  - Website URL submission for crawling
 *  - FAQ entry creation
 *  - Document deletion
 *
 * File handling pattern: the client sends a `FormData` with the file blob.
 * The server action receives it, validates the MIME type against the allowed
 * list, reads it into a Buffer, and passes it to the document service.
 * The actual file is NOT stored on disk — it's processed in-memory and only
 * the extracted text + embeddings are persisted to Postgres.
 */
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceId } from "@/lib/auth/session";
import { createDocument, deleteDocument, listDocuments } from "@/services/documents";
import type { ActionResponse } from "@/types";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
];

export async function uploadDocumentAction(
  botPublicId: string,
  formData: FormData,
): Promise<ActionResponse<{ documentId: string }>> {
  try {
    const workspaceId = await requireWorkspaceId();

    const file = formData.get("file") as File | null;
    if (!file) {
      return { ok: false, error: "No file provided" };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        ok: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        ok: false,
        error: `Unsupported file type: ${file.type}. Accepted: PDF, TXT, CSV.`,
      };
    }

    // Determine document type from MIME
    const typeMap: Record<string, "PDF" | "TXT" | "CSV"> = {
      "application/pdf": "PDF",
      "text/plain": "TXT",
      "text/csv": "CSV",
      "text/markdown": "TXT",
    };

    const buffer = Buffer.from(await file.arrayBuffer());

    const doc = await createDocument(workspaceId, botPublicId, {
      type: typeMap[file.type] ?? "TXT",
      name: file.name,
      fileBuffer: buffer,
    });

    // Processing is synchronous — if it failed, surface the reason to the user
    // rather than silently returning "success" with a FAILED document.
    if (doc.status === "FAILED") {
      // Re-fetch to get the errorMessage that processDocument stored
      const failedDoc = await prisma.document.findUnique({
        where: { id: doc.id },
        select: { errorMessage: true },
      });
      const detail = failedDoc?.errorMessage ?? "Unknown error";
      return {
        ok: false,
        error: `Processing failed: ${detail}`,
      };
    }

    return { ok: true, data: { documentId: doc.id } };
  } catch (err) {
    console.error("uploadDocumentAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to upload document",
    };
  }
}

export async function addWebsiteAction(
  botPublicId: string,
  url: string,
): Promise<ActionResponse<{ documentId: string }>> {
  try {
    const workspaceId = await requireWorkspaceId();

    const parsed = z.string().url().safeParse(url);
    if (!parsed.success) {
      return { ok: false, error: "Please enter a valid URL" };
    }

    const doc = await createDocument(workspaceId, botPublicId, {
      type: "WEBSITE",
      name: new URL(url).hostname,
      url: parsed.data,
    });

    if (doc.status === "FAILED") {
      const failedDoc = await prisma.document.findUnique({
        where: { id: doc.id },
        select: { errorMessage: true },
      });
      const detail = failedDoc?.errorMessage ?? "Unknown error";
      return {
        ok: false,
        error: `Processing failed: ${detail}`,
      };
    }

    return { ok: true, data: { documentId: doc.id } };
  } catch (err) {
    console.error("addWebsiteAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to add website",
    };
  }
}

export async function addFaqAction(
  botPublicId: string,
  question: string,
  answer: string,
): Promise<ActionResponse<void>> {
  try {
    const workspaceId = await requireWorkspaceId();
    const { scopedPrisma, belongsToWorkspace } = await import("@/lib/auth/scoped");

    const scoped = scopedPrisma({ workspaceId });

    const bot = await scoped.bot.findUnique({ where: { publicId: botPublicId } });
    if (!bot) return { ok: false, error: "Bot not found" };
    belongsToWorkspace(bot, workspaceId);

    await scoped.faq.create({
      data: {
        botId: bot.id,
        question: question.trim(),
        answer: answer.trim(),
      },
    });

    return { ok: true, data: undefined };
  } catch (err) {
    console.error("addFaqAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to add FAQ",
    };
  }
}

export async function listDocumentsAction(
  botPublicId: string,
): Promise<
  ActionResponse<
    Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      progress: number;
      chunkCount: number | null;
      createdAt: Date;
    }>
  >
> {
  try {
    const workspaceId = await requireWorkspaceId();
    const docs = await listDocuments(workspaceId, botPublicId);
    return {
      ok: true,
      data: docs.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        status: d.status,
        progress: d.progress,
        chunkCount: d.chunkCount,
        createdAt: d.createdAt,
      })),
    };
  } catch (err) {
    console.error("listDocumentsAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to list documents",
    };
  }
}

export async function deleteDocumentAction(
  documentId: string,
): Promise<ActionResponse<void>> {
  try {
    const workspaceId = await requireWorkspaceId();
    await deleteDocument(workspaceId, documentId);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("deleteDocumentAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete document",
    };
  }
}
