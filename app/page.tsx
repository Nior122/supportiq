/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The public landing page at `/`. This is the marketing homepage that converts
 * visitors into sign-ups. It's structured as a long-scroll single-page layout
 * with distinct sections:
 *
 *  1. Hero — headline, subheadline, CTA buttons, and a product preview mockup
 *  2. Features — 3-column grid of key capabilities
 *  3. How It Works — 3-step onboarding flow
 *  4. Pricing — tier cards (Free, Pro, Enterprise)
 *  5. FAQ — accordion-style questions
 *  6. CTA — final conversion section
 *
 * This is a Server Component for fast initial paint. Interactive pieces (FAQ
 * accordion, pricing toggle) would be client components — but for now the
 * pricing is static with all prices shown.
 *
 * SEO: The `<title>` comes from the root layout's `metadata.title.default`.
 * The page includes semantic HTML landmarks (`<section>`, `<nav>`, `<article>`)
 * and descriptive headings for crawlability.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "SupportIQ — AI Customer Support That Actually Helps",
  description:
    "Create, train, and embed an AI-powered customer support assistant trained on your content. Supports PDFs, websites, and FAQs. Powered by OpenAI, Anthropic, and Groq.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SupportIQ — AI Customer Support That Actually Helps",
    description:
      "Create, train, and embed an AI-powered customer support assistant trained on your content.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SupportIQ" }],
  },
};
import {
  Bot,
  MessageSquare,
  BarChart3,
  Users,
  Zap,
  Shield,
  Globe,
  FileText,
  Check,
  ChevronDown,
} from "lucide-react";

/* ──────────────────────────── Data ──────────────────────────── */

const features = [
  {
    icon: Bot,
    title: "AI-Powered Bots",
    description:
      "Create intelligent support bots that understand your business. Train on PDFs, websites, FAQs, and more.",
  },
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description:
      "Human-like chat with streaming responses, markdown formatting, and citation-backed answers.",
  },
  {
    icon: FileText,
    title: "Knowledge Base",
    description:
      "Upload documents, crawl websites, or write FAQs. Your bot automatically finds the right answer.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track conversations, response times, satisfaction scores, and top questions — all in real time.",
  },
  {
    icon: Users,
    title: "Lead Capture",
    description:
      "Automatically collect visitor info during conversations. Export leads to your CRM in one click.",
  },
  {
    icon: Globe,
    title: "One-Line Embed",
    description:
      "Add SupportIQ to any website with a single `<script>` tag. Works with any platform or framework.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 ready. Your data is encrypted at rest and in transit. GDPR compliant out of the box.",
  },
  {
    icon: Zap,
    title: "Multi-Provider AI",
    description:
      "Choose between OpenAI, Anthropic, or Groq per bot. Mix and match for cost and quality.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create a bot",
    description: "Name it, choose a model, set its personality and language.",
  },
  {
    number: "2",
    title: "Add knowledge",
    description: "Upload PDFs, add website URLs, or write FAQ entries.",
  },
  {
    number: "3",
    title: "Embed & go live",
    description: "Copy one script tag, paste it on your site, and you're live.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out SupportIQ on a personal project.",
    features: [
      "1 bot",
      "100 conversations / month",
      "1 knowledge base document",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    description: "For growing businesses that need more power and customization.",
    features: [
      "Unlimited bots",
      "5,000 conversations / month",
      "Unlimited documents & crawling",
      "Advanced analytics & leads",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams that need SSO, SLA, dedicated support, and custom integrations.",
    features: [
      "Everything in Pro",
      "Unlimited conversations",
      "SSO / SAML",
      "Dedicated support engineer",
      "Custom AI model fine-tuning",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "#",
    highlighted: false,
  },
];

const faqItems = [
  {
    q: "How does the AI know about my business?",
    a: "You upload documents (PDFs, text files), add website URLs to crawl, or write FAQ entries. SupportIQ creates vector embeddings of your content and uses RAG (Retrieval-Augmented Generation) to find the most relevant information when a visitor asks a question.",
  },
  {
    q: "Which AI models do you support?",
    a: "We support OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku), and Groq (Llama 3, Mixtral). You can choose a different model for each bot, and switch anytime.",
  },
  {
    q: "Can I customize the chat widget?",
    a: "Yes. You can change colors, the greeting message, quick replies, bot name, and avatar. The widget matches your brand — not ours.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We're SOC 2 Type II compliant and GDPR ready. Your documents never leave your workspace.",
  },
  {
    q: "Can I export conversations and leads?",
    a: "Yes. You can export conversation history and lead data as CSV from the dashboard at any time. There's also a webhook integration for pushing leads to your CRM.",
  },
  {
    q: "How accurate are the bot responses?",
    a: "Our RAG pipeline retrieves the most relevant document chunks before generating an answer, and includes citations so you can verify accuracy. Most customers report 85-95% accuracy for common questions after initial training.",
  },
];

/* ──────────────────────────── Components ──────────────────────────── */

function FAQItem({ item }: { item: (typeof faqItems)[number] }) {
  return (
    <details className="group border-b py-4">
      <summary className="flex cursor-pointer items-center justify-between font-medium text-foreground">
        {item.q}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {item.a}
      </p>
    </details>
  );
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <JsonLd type="landing" />
      <SiteHeader />

      <main>
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_var(--primary),transparent)] opacity-[0.03]" />

          <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Customer support that{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  actually helps
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                Create an AI-powered support assistant trained on your business.
                Reduce response time, capture leads, and make your customers happy — all
                with one embeddable widget.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">See Features</a>
              </Button>
            </div>

            {/* Social proof */}
            <p className="mt-6 text-sm text-muted-foreground">
              Free forever on the starter plan · No credit card required
            </p>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="features" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need
              </h2>
              <p className="mt-3 text-muted-foreground">
                From training to analytics, SupportIQ handles the full lifecycle of
                AI-powered customer support.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border bg-background">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Live in 3 steps
              </h2>
              <p className="mt-3 text-muted-foreground">
                No complex setup. No training data wrangling. Just results.
              </p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section id="pricing" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-muted-foreground">
                Start free. Scale when you&apos;re ready. No surprises.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative flex flex-col ${
                    tier.highlighted
                      ? "border-primary shadow-lg ring-1 ring-primary/10"
                      : ""
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      {tier.period && (
                        <span className="text-sm text-muted-foreground">
                          {" "}
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    <ul className="flex-1 space-y-2">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="mt-6 w-full"
                      variant={tier.highlighted ? "primary" : "outline"}
                      asChild
                    >
                      <Link href={tier.href}>{tier.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-10">
              {faqItems.map((item) => (
                <FAQItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="border-t py-20">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your support?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join hundreds of businesses using SupportIQ to deliver faster,
              smarter customer support.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/sign-up">Get Started Free →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
