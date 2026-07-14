/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Seeds a demo workspace + bot + a sample knowledge-base document so a freshly
 * onboarded developer (or a demo account) sees a populated dashboard instead of an
 * empty state. This is the same create-path the onboarding wizard will use, so it
 * doubles as the canonical "how to construct a bot row" example.
 *
 * Idempotent: re-running won't duplicate data because of the unique constraints
 * (clerkOrgId, slug, publicId). We upsert by the natural key.
 */
import { PrismaClient, ModelProvider, DocumentType, TrainingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoOrgId = process.env.SEED_CLERK_ORG_ID ?? "org_demo_acme";
  const demoUserId = process.env.SEED_CLERK_USER_ID ?? "user_demo_owner";

  // 1. Workspace — upsert by Clerk org id (the natural tenancy key).
  const workspace = await prisma.workspace.upsert({
    where: { clerkOrgId: demoOrgId },
    update: {},
    create: {
      clerkOrgId: demoOrgId,
      name: "Acme Inc.",
      slug: "acme",
      plan: "GROWTH",
    },
  });

  // 2. Owner user — linked to the workspace.
  await prisma.user.upsert({
    where: { clerkUserId: demoUserId },
    update: {},
    create: {
      clerkUserId: demoUserId,
      email: "owner@acme.example",
      firstName: "Demo",
      lastName: "Owner",
      role: "OWNER",
      workspaceId: workspace.id,
    },
  });

  // 3. A demo support bot with a personality + appearance.
  const bot = await prisma.bot.upsert({
    where: { publicId: "bot_demo_support" },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Acme Support",
      publicId: "bot_demo_support",
      description: "Front-line customer support for Acme.",
      modelProvider: ModelProvider.GROQ,
      modelId: "llama-3.3-70b-versatile",
      temperature: 0.3,
      systemPrompt:
        "You are Acme's friendly customer support assistant. Answer using the provided knowledge base. If unsure, say so and offer to capture the visitor's contact info.",
      persona: "friendly",
      language: "en",
      memory: "SESSION",
      greeting: "Hi! 👋 I'm Acme's support assistant. How can I help today?",
      welcomeMessage: "Ask me anything about our products.",
      quickReplies: ["Pricing", "Returns", "Talk to a human"],
      leadCapture: true,
      leadFields: ["NAME", "EMAIL", "COMPANY"],
      appearance: {
        primaryColor: "#4f46e5",
        accentColor: "#818cf8",
        borderRadius: 12,
        position: "bottom-right",
        size: "default",
        font: "system",
      },
      rateLimitPerMinute: 30,
    },
  });

  // 4. A sample text-source document already chunked and marked READY (no embedding
  //    in seed — the ingestion service handles that in real usage).
  await prisma.document.create({
    data: {
      botId: bot.id,
      type: DocumentType.TEXT,
      title: "Return Policy",
      content:
        "Acme offers a 30-day return window on all physical products. Items must be unused and in original packaging. Start a return at acme.example/returns and include your order number. Refunds post within 5 business days.",
      status: TrainingStatus.READY,
      progress: 100,
      chunkCount: 1,
      charCount: 220,
    },
  });

  // 5. A FAQ entry so the FAQ tab is non-empty.
  await prisma.faq.create({
    data: {
      botId: bot.id,
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return window on physical products. Items must be unused and in original packaging.",
    },
  });

  console.log("🌱 Seed complete:", { workspace: workspace.id, bot: bot.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
