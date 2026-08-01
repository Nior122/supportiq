/**
 * SupportIQ AI Rebrand - Complete Premium Landing Page
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
  Activity,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIParticles } from "@/components/animations/AIParticles";
import { FloatingRobot } from "@/components/animations/FloatingRobot";
import { FloatingCard } from "@/components/animations/FloatingCard";
import { ChatDemo } from "@/components/animations/ChatDemo";
import { WorkflowAnimation } from "@/components/animations/WorkflowAnimation";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Intelligence",
    description: "Our proprietary RAG pipeline trained on your business documents ensures pinpoint accuracy.",
  },
  {
    icon: MessageSquare,
    title: "Seamless Interactions",
    description: "Human-grade streaming responses that understand context and resolve issues in seconds.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Comprehensive insights into customer behavior, resolution rates, and bot performance.",
  },
  {
    icon: Globe,
    title: "Universal Integration",
    description: "Deploy to any platform with a single script tag. Works with Shopify, Webflow, and more.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "GDPR, SOC 2 ready infrastructure with isolated data layers for complete privacy.",
  },
  {
    icon: Zap,
    title: "Multi-Model Logic",
    description: "Leverage the best models from OpenAI, Anthropic, and Groq for every specific task.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for exploring AI support.",
    features: ["1 AI Assistant", "100 messages / mo", "Basic analytics", "Standard support"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "For growing teams and businesses.",
    features: ["Unlimited assistants", "5,000 messages / mo", "Custom branding", "Lead capture", "Priority support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Total control for high-volume teams.",
    features: ["Dedicated infrastructure", "Custom SLA", "White-labeling", "SAML/SSO", "Direct API access"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function FAQItem({ item }: { item: { q: string; a: string } }) {
  return (
    <details className="group border-b border-slate-200 py-6 dark:border-slate-800">
      <summary className="flex cursor-pointer items-center justify-between text-lg font-bold transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
        {item.q}
        <ChevronDown className="h-5 w-4 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="overflow-hidden transition-all group-open:animate-in group-open:fade-in group-open:slide-in-from-top-2">
        <p className="pb-2 pt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          {item.a}
        </p>
      </div>
    </details>
  );
}

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#F8FAFC] selection:bg-blue-100 selection:text-blue-700 dark:bg-[#020617]">
      <JsonLd type="landing" />
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 lg:pt-48 pb-20">
          <div className="absolute inset-0 -z-10">
             <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 bg-blue-500/5 blur-[120px]" />
             <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
             <AIParticles />
          </div>

          <div className="container relative z-10 px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 mb-8 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-400">
                    <Sparkles className="h-3 w-3" />
                    Experience Enterprise AI
                  </div>
                  <h1 className="text-6xl font-extrabold tracking-tighter text-slate-900 sm:text-7xl lg:text-[88px] lg:leading-[1] mb-8 dark:text-white">
                    Intelligent support <br />
                    <span className="ai-gradient-text">for everyone.</span>
                  </h1>
                  <p className="mx-auto lg:mx-0 mt-10 max-w-[700px] text-xl leading-relaxed text-slate-600 sm:text-2xl dark:text-slate-400">
                     Automate your customer service with AI that actually understands. 
                     Deploy intelligent assistants in minutes.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-12 flex flex-col items-center lg:items-start justify-center lg:justify-start gap-6 sm:flex-row"
                >
                  <Button size="lg" className="rounded-xl shadow-glow px-10" asChild>
                    <Link href="/sign-up">Get Started for Free</Link>
                  </Button>
                  <Button size="lg" variant="secondary" className="rounded-xl px-10 group" asChild>
                    <a href="#features">
                      See Features <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </motion.div>
              </div>

              <div className="flex-1 w-full max-w-[500px] aspect-square relative">
                 <FloatingRobot />
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="bg-white py-32 lg:py-48 dark:bg-slate-950/50">
           <div className="container px-6">
              <div className="grid gap-16 lg:grid-cols-2 items-center">
                 <div>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-8 dark:text-white leading-tight">
                       The intelligence behind <br/>
                       <span className="text-blue-600 dark:text-blue-400">every resolution.</span>
                    </h2>
                    <p className="text-xl text-slate-600 mb-12 dark:text-slate-400 leading-relaxed">
                       SupportIQ doesn&apos;t just respond; it understands. Our platform processes your documentation to provide grounded, reliable answers.
                    </p>
                    <div className="space-y-8">
                       {[
                         { icon: Search, title: "1. Data Ingestion", desc: "Connect your docs, website, or FAQs." },
                         { icon: Layers, title: "2. Vector Processing", desc: "We slice and embed your data into a secure vector store." },
                         { icon: Activity, title: "3. Real-time Inference", desc: "The AI retrieves context and answers in milliseconds." },
                       ].map((step, i) => (
                         <div key={i} className="flex gap-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                               <step.icon className="h-6 w-6" />
                            </div>
                            <div>
                               <h4 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h4>
                               <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="flex-1 w-full flex flex-col items-center gap-12 relative">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
                    <WorkflowAnimation />
                    <ChatDemo />
                 </div>
              </div>
           </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container px-6 py-32 lg:py-48">
          <div className="mx-auto max-w-4xl text-center mb-24">
             <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
                Engineered for <span className="text-blue-600 dark:text-blue-400">Reliability.</span>
             </h2>
             <p className="mt-8 text-xl text-slate-600 dark:text-slate-400">
                A comprehensive suite of tools built to handle enterprise-level support complexity.
             </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FloatingCard key={feature.title} delay={i * 100}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative flex flex-col h-full rounded-[2rem] border border-slate-200 bg-white p-10 transition-all hover:border-blue-500/30 hover:shadow-premium dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-blue-400/30"
                >
                  <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-500">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 dark:text-white font-mono uppercase text-[15px] tracking-widest">{feature.title}</h3>
                  <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              </FloatingCard>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-[#F8FAFC] py-32 lg:py-48 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800">
          <div className="container px-6">
            <div className="mx-auto max-w-3xl text-center mb-24">
               <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">Professional Plans.</h2>
               <p className="mt-8 text-xl text-slate-600 dark:text-slate-400">Transparent pricing built to scale with your customer success.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`flex flex-col rounded-[2.5rem] p-10 transition-all hover:-translate-y-1 ${
                    tier.highlighted 
                      ? "border-blue-600/50 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.12)] ring-1 ring-blue-600/20" 
                      : "border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50"
                  }`}
                >
                  <div className="mb-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-4 dark:text-blue-400">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">{tier.price}</span>
                      {tier.price !== "Custom" && <span className="text-slate-500 font-medium">/mo</span>}
                    </div>
                    <p className="mt-4 text-slate-500 dark:text-slate-400">{tier.description}</p>
                  </div>

                  <div className="flex-1 space-y-4 mb-10">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center dark:bg-blue-900/20">
                           <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    className="rounded-xl font-bold w-full"
                    variant={tier.highlighted ? "primary" : "secondary"}
                    asChild
                  >
                    <Link href="/sign-up">{tier.cta}</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container px-6 py-32 lg:py-48">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-20 dark:text-white">Frequently Asked Questions</h2>
            <div className="grid gap-2">
              {[
                { q: "How does SupportIQ train on my data?", a: "Simply upload your PDF documents, paste URLs, or connect your existing knowledge base. Our AI extracts context to provide accurate answers." },
                { q: "Is my business data secure?", a: "Yes. SupportIQ uses isolated vector stores for every organization. Your data is encrypted and never used for general LLM training." },
                { q: "Can I customize the look of the chat widget?", a: "Absolutely. Pro and Enterprise plans allow complete white-labeling, including colors, icons, and custom avatars." },
              ].map((item) => (
                <FAQItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-32 lg:py-48 relative overflow-hidden">
           <div className="absolute inset-0 bg-white/5 bg-grid-pattern pointer-events-none" />
           <div className="container relative z-10 px-6 text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-8">
                 Experience the future of support.
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-blue-100 mb-12">
                 Join the growing list of businesses automating customer success with SupportIQ.
              </p>
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                 <Button size="lg" className="rounded-xl bg-white text-blue-600 hover:bg-slate-50 px-12" asChild>
                    <Link href="/sign-up">Start Free Trial</Link>
                 </Button>
                 <Button size="lg" variant="outline" className="rounded-xl border-white/30 text-white hover:bg-white/10 px-12" asChild>
                    <Link href="/demo">Talk to Sales</Link>
                 </Button>
              </div>
           </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
