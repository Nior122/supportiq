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
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Check,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

/* ──────────────────────────── Data ──────────────────────────── */

const features = [
  {
    icon: Bot,
    title: "AI-Powered Bots",
    description: "Train intelligent bots on your PDFs, sites, and FAQs.",
    size: "large",
  },
  {
    icon: MessageSquare,
    title: "Natural Chat",
    description: "Human-like streaming responses with citations.",
    size: "small",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Track performance and satisfaction in real time.",
    size: "small",
  },
  {
    icon: Globe,
    title: "One-Line Embed",
    description: "Add to any website with a single script tag.",
    size: "large",
  },
  {
    icon: Shield,
    title: "Enterprise Grade",
    description: "SOC 2 ready, GDPR compliant, and secure.",
    size: "small",
  },
  {
    icon: Zap,
    title: "Multi-Model",
    description: "OpenAI, Anthropic, or Groq per bot.",
    size: "small",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for exploring SupportIQ.",
    features: ["1 bot", "100 messages / mo", "Basic analytics"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "For growing businesses.",
    features: ["Unlimited bots", "5k messages / mo", "Custom branding", "Lead capture"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For high-volume teams.",
    features: ["SSO / SAML", "Dedicated support", "SLA guarantee", "Fine-tuning"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

/* ──────────────────────────── Components ──────────────────────────── */

function FAQItem({ item }: { item: { q: string; a: string } }) {
  return (
    <details className="group border-b border-border/50 py-4">
      <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium transition-colors hover:text-primary">
        {item.q}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="overflow-hidden transition-all group-open:animate-in group-open:fade-in group-open:slide-in-from-top-2">
        <p className="pb-2 pt-3 text-[14px] leading-relaxed text-muted-foreground">
          {item.a}
        </p>
      </div>
    </details>
  );
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col selection:bg-primary/10 selection:text-primary">
      <JsonLd type="landing" />
      <SiteHeader />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-24 lg:pt-32">
          {/* Ambient background elements */}
          <div className="absolute inset-0 -z-10 mx-auto max-w-7xl">
            <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 bg-primary/5 opacity-50 blur-[120px]" />
            <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_100%)] opacity-[0.05]" />
          </div>

          <div className="container relative px-6">
            <div className="mx-auto max-w-[800px] text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  Now powered by Llama 3.3
                </span>
                <h1 className="mt-8 text-5xl font-bold tracking-[-0.03em] sm:text-7xl lg:text-[84px] lg:leading-[1.1]">
                  AI support that{" "}
                  <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    scales with you
                  </span>
                </h1>
                <p className="mx-auto mt-8 max-w-[600px] text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  Train an AI assistant on your documents in minutes. Embed it anywhere, 
                  capture leads, and automate your support workflow without losing the human touch.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Button size="lg" className="h-12 rounded-full px-8 font-semibold shadow-premium" asChild>
                  <Link href="/sign-up">Start for free</Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-12 rounded-full px-8 font-semibold" asChild>
                  <a href="#features" className="group">
                    See Features <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </motion.div>
            </div>

            {/* Product Mockup / Visual */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto mt-20 max-w-5xl"
            >
              <div className="relative rounded-2xl border border-border/50 bg-background/50 p-2 shadow-2xl backdrop-blur-sm">
                <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/20 shadow-inner">
                  {/* Mock dashboard window */}
                  <div className="flex h-10 items-center gap-2 border-b border-border/50 bg-muted/40 px-4">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-border" />
                      <div className="h-2.5 w-2.5 rounded-full bg-border" />
                      <div className="h-2.5 w-2.5 rounded-full bg-border" />
                    </div>
                    <div className="mx-auto h-5 w-48 rounded-md bg-border/20" />
                  </div>
                  <div className="aspect-[16/10] bg-gradient-to-br from-background to-muted/20" />
                </div>
              </div>
              {/* Floating accents */}
              <div className="absolute -left-12 top-1/2 -z-10 h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-[80px]" />
              <div className="absolute -right-12 bottom-0 -z-10 h-64 w-64 animate-pulse rounded-full bg-accent/10 blur-[80px]" />
            </motion.div>
          </div>
        </section>

        {/* ─── Features (Bento Grid) ─── */}
        <section id="features" className="container px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Built for precision</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete toolkit to build, train, and deploy AI assistants that actually understand your business.
            </p>
          </div>

          <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
                className={`${feature.size === "large" ? "lg:col-span-3" : "lg:col-span-2"} group relative rounded-2xl border border-border/50 bg-background p-8 shadow-sm transition-all hover:shadow-md`}
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Steps ─── */}
        <section className="bg-muted/30 py-24 lg:py-32">
          <div className="container px-6">
            <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="max-w-[480px]">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Go live in three simple steps.</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Our RAG pipeline handles the heavy lifting. Just bring your content, we&apos;ll handle the intelligence.
                </p>
                <div className="mt-10 space-y-8">
                  {[
                    { title: "Connect your data", desc: "Upload PDFs or crawl your site." },
                    { title: "Customize the bot", desc: "Set personality and choosing your model." },
                    { title: "Embed the script", desc: "Copy-paste one line of code to your site." },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square w-full max-w-[500px] rounded-3xl border border-border bg-background shadow-elevated overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                {/* Abstract visual placeholder */}
                <div className="flex h-full items-center justify-center text-muted-foreground/20">
                  <Bot size={120} strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section id="pricing" className="container px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Simple pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to automate support. Scale as you grow.
            </p>
          </div>

          <div className="mt-20 grid gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col rounded-3xl p-8 shadow-card transition-transform hover:scale-[1.02] ${
                  tier.highlighted ? "border-primary ring-1 ring-primary/20" : "border-border/50"
                }`}
              >
                <div className="mb-8">
                  <h3 className="text-lg font-bold">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <div className="flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`mt-8 h-11 w-full rounded-xl font-semibold ${
                    tier.highlighted ? "shadow-premium" : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  variant={tier.highlighted ? "primary" : "secondary"}
                  asChild
                >
                  <Link href="/sign-up">{tier.cta}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="bg-muted/30 py-24 lg:py-32">
          <div className="container max-w-4xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Common questions</h2>
            <div className="mt-12 space-y-1">
              {[
                { q: "How secure is my data?", a: "We encrypt all data at rest and in transit. Your documents are strictly scoped to your bot and never used for training foundation models." },
                { q: "Can I use my own models?", a: "You can choose between OpenAI, Anthropic, and Groq models. We use our API keys by default, or you can bring your own for custom limits." },
                { q: "Does it work with WordPress?", a: "Yes. Our widget works with any site that allows you to paste a single script tag into the head or body." },
              ].map((item) => (
                <FAQItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
