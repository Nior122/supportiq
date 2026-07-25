/**
 * SupportIQ Site Footer - Premium AI Rebrand
 */
import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

const footerSections = [
  {
    title: "Intelligence",
    links: [
      { label: "Features", href: "#features" },
      { label: "AI Models", href: "#" },
      { label: "RAG Pipeline", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Changelog", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Integrations", href: "#" },
    ],
  },
  {
    title: "Corporate",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-background pt-24 pb-12">
      <div className="mx-auto max-w-screen-2xl px-8">
        <div className="grid gap-16 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ai-gradient shadow-glow">
                <span className="text-xl font-black text-white font-mono">S</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-foreground uppercase">SupportIQ</span>
            </Link>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mb-10">
              The intelligent AI infrastructure for modern customer success. 
              Built for performance, precision, and privacy.
            </p>
            <div className="flex gap-4">
               {[Twitter, Github, Linkedin].map((Icon, i) => (
                 <a key={i} href="#" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                    <Icon className="h-5 w-5" />
                 </a>
               ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 mb-8 font-mono">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-base text-muted-foreground transition-all hover:text-primary hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <Sparkles className="h-3 w-3 text-primary" />
            Designed for the future of support
          </div>
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} SupportIQ. Enterprise AI_SYS_V2.0
          </div>
        </div>
      </div>
    </footer>
  );
}
