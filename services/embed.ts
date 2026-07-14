/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Embed token service. Manages the security boundary between the embed widget
 * (unauthenticated, runs on customer websites) and the SupportIQ backend.
 *
 * Token lifecycle:
 *  1. When a user creates a bot, an EmbedToken is generated with a HMAC-signed
 *     token string and optional origin allowlist.
 *  2. The embed script includes this token in requests to /api/chat.
 *  3. The chat API verifies the token is valid and not revoked.
 *  4. If origin allowlisting is enabled, the API checks the Referer header.
 *
 * This is NOT a JWT — it's a signed opaque string. We don't need expiry because
 * revocation is handled via the `revokedAt` field. The HMAC key is stored in
 * `EMBED_SIGNING_SECRET` env var.
 */
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const ALGORITHM = "sha256";

function getSigningKey(): Buffer {
  if (!env.EMBED_SIGNING_SECRET) {
    throw new Error("EMBED_SIGNING_SECRET is required for embed tokens.");
  }
  return Buffer.from(env.EMBED_SIGNING_SECRET, "hex");
}

/** Generate a new embed token for a bot. */
export async function generateEmbedToken(
  workspaceId: string,
  botId: string,
  allowedOrigins: string[] = [],
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const signature = crypto
    .createHmac(ALGORITHM, getSigningKey())
    .update(rawToken)
    .digest("hex");

  const token = `${rawToken}.${signature}`;

  await prisma.embedToken.create({
    data: {
      botId,
      token,
      allowedOrigins,
    },
  });

  return token;
}

/** Verify an embed token is valid and not revoked. */
export async function verifyEmbedToken(
  token: string,
  origin?: string,
): Promise<{ valid: boolean; botId?: string; workspaceId?: string }> {
  const [rawToken, signature] = token.split(".");
  if (!rawToken || !signature) {
    return { valid: false };
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac(ALGORITHM, getSigningKey())
    .update(rawToken)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))) {
    return { valid: false };
  }

  // Look up token in DB
  const embedToken = await prisma.embedToken.findUnique({
    where: { token },
    include: {
      bot: {
        select: {
          id: true,
          workspaceId: true,
          status: true,
        },
      },
    },
  });

  if (!embedToken || embedToken.revokedAt) {
    return { valid: false };
  }

  if (embedToken.bot.status !== "ACTIVE") {
    return { valid: false };
  }

  // Check origin allowlist if configured
  if (embedToken.allowedOrigins.length > 0 && origin) {
    const isAllowed = embedToken.allowedOrigins.some((allowed) =>
      origin.startsWith(allowed),
    );
    if (!isAllowed) {
      return { valid: false };
    }
  }

  return {
    valid: true,
    botId: embedToken.bot.id,
    workspaceId: embedToken.bot.workspaceId,
  };
}

/** Revoke an embed token. */
export async function revokeEmbedToken(
  workspaceId: string,
  tokenId: string,
): Promise<void> {
  await prisma.embedToken.update({
    where: { id: tokenId },
    data: { revokedAt: new Date() },
  });
}

/** List all embed tokens for a bot. */
export async function listEmbedTokens(workspaceId: string, botId: string) {
  return prisma.embedToken.findMany({
    where: { botId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      token: true,
      allowedOrigins: true,
      revokedAt: true,
      createdAt: true,
    },
  });
}
