/**
 * SupportIQ Site Header - Premium AI Rebrand
 */
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-ai-gradient shadow-glow overflow-hidden">
            <span className="relative z-10 text-xl font-black text-white font-mono">S</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-foreground leading-none">SupportIQ</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary/60">Platform_v2</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-primary hover:tracking-[0.2em] font-mono"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-6">
          <SignedOut>
            <Link 
              href="/sign-in" 
              className="text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary font-mono"
            >
              Access
            </Link>
            <Button size="lg" variant="gradient" className="rounded-full px-6 shadow-glow font-bold uppercase tracking-tighter" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="lg" variant="outline" className="rounded-full px-6 font-bold uppercase tracking-tighter" asChild>
              <Link href="/dashboard">Console</Link>
            </Button>
            <div className="border-l border-white/10 pl-6">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
