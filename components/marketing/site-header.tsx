/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Public site header for the marketing/landing pages. Minimal and focused:
 * logo, nav links (Features, Pricing, Docs), and CTA buttons (Sign In / Get Started).
 * Uses the Clerk `<SignedIn>` / `<SignedOut>` primitives to conditionally show
 * different CTAs without any custom auth state.
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <span className="text-sm font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-base font-bold tracking-tight">SupportIQ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auth-aware CTA */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link 
              href="/sign-in" 
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary font-mono"
            >
              Sign In
            </Link>
            <Button size="sm" className="h-8 rounded-none px-4 text-[10px] font-bold uppercase tracking-widest" asChild>
              <Link href="/sign-up">Start Free</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="sm" variant="secondary" className="h-8 rounded-none px-4 text-[10px] font-bold uppercase tracking-widest" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
