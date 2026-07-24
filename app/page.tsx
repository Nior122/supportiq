/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The public landing page at `/`. This is the marketing homepage that converts
 * visitors into sign-ups. It's structured as a long-scroll single-page layout
 * with distinct sections:
 *
 *  1. Hero — headline, subheadline, CTA buttons
 *  2. Features — 3-column grid of key capabilities
 *  3. How It Works — 3-step onboarding flow
 *  4. Pricing — tier cards (Free, Pro, Enterprise)
 *  5. FAQ — accordion-style questions
 *  6. CTA — final conversion section
 *
 * All sections are transparent to allow the GlobalSplineBackground to show through.
 * Content layer in layout.tsx ensures interactivity with the background.
 */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <details className="group border-b border-white/10 py-4 pointer-events-auto">
      <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium transition-colors hover:text-primary text-white">
        {item.q}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="overflow-hidden transition-all group-open:animate-in group-open:fade-in group-open:slide-in-from-top-2">
        <p className="pb-2 pt-3 text-[14px] leading-relaxed text-neutral-400">
          {item.a}
        </p>
      </div>
    </details>
  );
}

/* ──────────────────────────── Page ──────────────────────────── */

export default function LandingPage() {
  return (
    <main className="flex-1">
      {/* ─── Hero ─── */}
      <section className="relative pt-24 lg:pt-32 min-h-[80vh] flex flex-col items-center justify-center">
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
              <h1 className="mt-8 text-5xl font-bold tracking-[-0.03em] sm:text-7xl lg:text-[84px] lg:leading-[1.1] text-white">
                AI support that{" "}
                <span className="bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">
                  scales with you
                </span>
              </h1>
              <p className="mx-auto mt-8 max-w-[600px] text-lg leading-relaxed text-neutral-300 sm:text-xl">
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
              <Button size="lg" variant="ghost" className="h-12 rounded-full px-8 font-semibold text-white hover:bg-white/10" asChild>
                <a href="#features" className="group">
                  See Features <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Features (Grid) ─── */}
      <section id="features" className="container px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-white">Built for precision</h2>
          <p className="mt-4 text-lg text-neutral-400">
            A complete toolkit to build, train, and deploy AI assistants that actually understand your business.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-sm transition-all hover:bg-white/10 hover:border-white/20"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-neutral-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Steps ─── */}
      <section className="py-24 lg:py-32">
        <div className="container px-6">
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="max-w-[480px]">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Go live in three simple steps.</h2>
              <p className="mt-4 text-lg text-neutral-400">
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
                      <h4 className="font-bold text-white">{step.title}</h4>
                      <p className="text-sm text-neutral-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square w-full max-w-[500px] rounded-3xl border border-white/10 bg-white/5 shadow-elevated overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              {/* Abstract visual placeholder */}
              <div className="flex h-full items-center justify-center text-white/10">
                <Bot size={120} strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="container px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-white">Simple pricing</h2>
          <p className="mt-4 text-lg text-neutral-400">
            Everything you need to automate support. Scale as you grow.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col rounded-3xl p-8 backdrop-blur-md transition-transform hover:scale-[1.02] bg-white/5 border-white/10 ${
                tier.highlighted ? "border-primary ring-1 ring-primary/20" : ""
              }`}
            >
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-white">{tier.price}</span>
                  <span className="text-sm text-neutral-400">/mo</span>
                </div>
                <p className="mt-4 text-sm text-neutral-400">{tier.description}</p>
              </div>

              <div className="flex-1 space-y-3">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`mt-8 h-11 w-full rounded-xl font-semibold ${
                  tier.highlighted ? "shadow-premium" : "bg-white/10 text-white hover:bg-white/20"
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
      <section id="faq" className="py-24 lg:py-32">
        <div className="container max-w-4xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl text-white">Common questions</h2>
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
  );
}
