/**
 * SupportIQ Marketing Header - Premium AI Blue
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/80 dark:border-slate-800/60">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ai-gradient-primary shadow-glow">
            <span className="text-xl font-extrabold text-white font-mono">S</span>
          </div>
          <div className="flex items-center text-xl font-bold tracking-tighter">
             <span className="text-[#2563EB]">Support</span>
             <span className="ai-gradient-text ml-0.5">IQ</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-semibold text-slate-600 transition-colors hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link 
              href="/sign-in" 
              className="text-[14px] font-semibold text-slate-600 transition-colors hover:text-[#2563EB] px-4 dark:text-slate-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Button size="default" className="rounded-xl shadow-glow" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="default" variant="secondary" className="rounded-xl" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
