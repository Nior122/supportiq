/**
 * WHY THIS FILE EXISTS
 * -------------------
 * A branded, centered card shell wrapping Clerk's `<SignIn />` / `<SignUp />` UI.
 * The background is the hero gradient (same palette as the marketing page, but dimmed)
 * and the card is a glass surface — this gives the auth pages a premium, cohesive feel
 * without touching the Clerk component's internals. The `<Logo />` is server-rendered
 * as an SVG at the top so the brand is visible even before Clerk's JS hydrates.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthCardShell({ children, title, subtitle }: AuthCardShellProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      {/* Hero gradient backdrop (same as landing, dimmed) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-hero-gradient opacity-60"
      />

      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[length:32px_32px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
      />

      {/* Card */}
      <div
        className={cn(
          "glass relative z-10 flex w-full max-w-md flex-col items-center gap-6 p-8",
          "rounded-2xl shadow-elevated",
        )}
      >
        {/* Brand mark */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {title && (
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        <div className="w-full">{children}</div>
      </div>

      {/* Footer link back to home */}
      <p className="absolute bottom-6 z-10 text-xs text-muted-foreground">
        &copy; 2026 SupportIQ
      </p>
    </main>
  );
}
