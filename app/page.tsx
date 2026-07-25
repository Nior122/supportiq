/**
 * SupportIQ Landing Page - Premium AI Rebrand
 */
"use client";

import Link from "next/link";
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
  Sparkles,
} from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { AnimatedBot } from "@/components/landing/animated-bot";

/* ──────────────────────────── Data ──────────────────────────── */

const features = [
  {
    icon: Bot,
    title: "AI-Powered Intelligence",
    description: "Advanced RAG pipeline trained on your business data for pinpoint accuracy.",
  },
  {
    icon: MessageSquare,
    title: "Seamless Conversations",
    description: "Human-grade streaming responses with full source attribution and citations.",
  },
  {
    icon: BarChart3,
    title: "Enterprise Analytics",
    description: "Deep insights into customer behavior and satisfaction metrics.",
  },
  {
    icon: Globe,
    title: "Universal Integration",
    description: "Deploy to any platform with a single line of code. Zero friction.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade encryption and privacy controls built-in.",
  },
  {
    icon: Zap,
    title: "Multi-Engine Support",
    description: "Select between Llama, GPT-4, or Claude for each specific use case.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    description: "Experience the power of AI support.",
    features: ["1 AI Assistant", "100 messages / mo", "Standard analytics"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "Scale your customer success team.",
    features: ["Unlimited assistants", "5k messages / mo", "Premium branding", "Lead generation"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Total control for high-volume teams.",
    features: ["Custom SLA", "Priority Support", "Dedicated node", "SAML/SSO"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function FAQItem({ item }: { item: { q: string; a: string } }) {
  return (
    <details className="group border-b border-primary/10 py-6">
      <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold transition-colors hover:text-primary">
        {item.q}
        <ChevronDown className="h-5 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="overflow-hidden transition-all group-open:animate-in group-open:fade-in group-open:slide-in-from-top-2">
        <p className="pb-2 pt-4 text-base leading-relaxed text-muted-foreground">
          {item.a}
        </p>
      </div>
    </details>
  );
}

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background selection:bg-primary/30 selection:text-primary">
      <JsonLd type="landing" />
      <SiteHeader />

      <main className="flex-1">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden pt-32 lg:pt-48">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 bg-primary/5 opacity-50 blur-[120px]" />
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
          </div>

          <div className="container relative z-10 px-6">
            <div className="mx-auto max-w-[900px] text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-8 shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Experience the new era of support
                </div>
                <h1 className="text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-[100px] lg:leading-[1] text-foreground mb-8">
                  Intelligent support <br />
                  <span className="ai-gradient-text">for everyone.</span>
                </h1>
                <p className="mx-auto mt-10 max-w-[700px] text-xl leading-relaxed text-muted-foreground sm:text-2xl">
                  Automate your customer service with AI that actually understands. 
                  Deploy intelligent assistants in minutes, trained on your data.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
              >
                <UIButton size="xl" variant="gradient" className="rounded-full shadow-glow animate-float" asChild>
                  <Link href="/sign-up">Start Building Now</Link>
                </UIButton>
                <UIButton size="xl" variant="outline" className="rounded-full group" asChild>
                  <a href="#features">
                    Explore Platform <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </UIButton>
              </motion.div>
            </div>

            {/* Premium App Preview */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative mx-auto mt-32 max-w-6xl"
            >
              <div className="relative rounded-[2.5rem] border border-white/10 bg-black/40 p-4 shadow-[0_0_100px_-20px_rgba(124,58,237,0.3)] backdrop-blur-xl">
                <div className="overflow-hidden rounded-[1.8rem] border border-white/5 bg-[#0F0728] shadow-inner">
                  <div className="flex h-12 items-center gap-2 border-b border-white/5 bg-white/5 px-6">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/50" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                      <div className="h-3 w-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-full bg-white/5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      app.supportiq.io
                    </div>
                  </div>
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#17112F] to-[#0F0728] flex items-center justify-center overflow-hidden">
                    <AnimatedBot />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Features Grid ─── */}
        <section id="features" className="container px-6 py-32 lg:py-48">
          <div className="mx-auto max-w-4xl text-center mb-24">
            <h2 className="text-4xl font-black tracking-tight sm:text-6xl text-foreground">
              Powerful tools. <span className="text-primary/60">Built for enterprise.</span>
            </h2>
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
              A comprehensive platform designed to handle your business complexity with ease.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative flex flex-col rounded-3xl border border-primary/10 bg-card p-10 transition-all hover:border-primary/40 hover:shadow-premium hover:-translate-y-1"
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── AI Social Proof / CTA ─── */}
        <section className="bg-primary/5 py-32 lg:py-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="container relative z-10 px-6">
            <div className="flex flex-col items-center justify-between gap-16 lg:flex-row">
              <div className="max-w-[550px]">
                <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground mb-8">
                  Deployment in <span className="ai-gradient-text text-6xl">minutes</span>, not weeks.
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                  Our advanced RAG engine automates the heavy lifting. Just upload your content, and let SupportIQ do the rest.
                </p>
                <div className="space-y-8">
                  {[
                    { title: "Universal Ingestion", desc: "PDFs, Notion, Websites, and FAQs. We crawl it all." },
                    { title: "Dynamic Tuning", desc: "Fine-tune persona and behavioral constraints with ease." },
                    { title: "Secure Deployment", desc: "One-line script. Unlimited reach. Total isolation." },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-glow group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{step.title}</h4>
                        <p className="text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square w-full max-w-[600px] rounded-[3rem] border border-primary/20 bg-card shadow-2xl overflow-hidden group">
                 <div className="absolute inset-0 bg-ai-gradient opacity-10 transition-opacity group-hover:opacity-20" />
                 <div className="flex h-full items-center justify-center">
                    <Sparkles className="h-48 w-42 text-primary animate-pulse" strokeWidth={0.5} />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Pricing Section ─── */}
        <section id="pricing" className="container px-6 py-32 lg:py-48">
          <div className="mx-auto max-w-4xl text-center mb-24">
            <h2 className="text-4xl font-black tracking-tight sm:text-6xl text-foreground">Transparent pricing.</h2>
            <p className="mt-8 text-xl text-muted-foreground">
              Choose the plan that fits your growth stage. No hidden fees.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col rounded-[2.5rem] p-12 transition-all hover:-translate-y-2 ${
                  tier.highlighted 
                    ? "border-primary/50 bg-card shadow-[0_20px_50px_-10px_rgba(124,58,237,0.3)] ring-2 ring-primary/20" 
                    : "border-primary/10 bg-card/50 hover:border-primary/30"
                }`}
              >
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-foreground mb-4 uppercase tracking-widest text-primary/80">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black tracking-tighter text-foreground">{tier.price}</span>
                    <span className="text-lg text-muted-foreground font-medium">/mo</span>
                  </div>
                  <p className="mt-6 text-muted-foreground leading-relaxed">{tier.description}</p>
                </div>

                <div className="flex-1 space-y-5 mb-10">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-4 text-foreground font-medium">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <UIButton
                  size="xl"
                  className="rounded-2xl font-bold shadow-soft"
                  variant={tier.highlighted ? "gradient" : "outline"}
                  asChild
                >
                  <Link href="/sign-up">{tier.cta}</Link>
                </UIButton>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section id="faq" className="bg-primary/5 py-32 lg:py-48 relative">
           <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="container max-w-5xl px-6 relative z-10">
            <h2 className="text-center text-4xl font-black tracking-tight sm:text-6xl text-foreground mb-20">Support Knowledge.</h2>
            <div className="grid gap-4">
              {[
                { q: "How secure is my training data?", a: "SupportIQ employs end-to-end AES-256 encryption. Your documents are never shared or used to train public LLM models." },
                { q: "Can I bring my own API keys?", a: "Yes. Enterprise customers can bring their own keys for Anthropic, OpenAI, or Groq to maintain complete sovereignty." },
                { q: "Does it support multilingual chat?", a: "Absolutely. Our AI assistants automatically detect and respond in over 90 languages with native-level proficiency." },
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
