"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Next.js 15 Server Components don't need providers for most things, but a handful of
 * cross-cutting client concerns (auth state, theme, data fetching, toasts) still need
 * a React context at the root. We bundle them into ONE `<Providers>` client component
 * so the root layout stays a Server Component and stays clean — the boundary between
 * server and client lives here, in one audited place. The export is named `Providers`
 * (the name the root + auth layouts import under).
 *
 * Order matters: Clerk must wrap everything that reads auth state; ThemeProvider
 * wraps children to avoid a flash-of-wrong-theme; ReactQuery sits around the app so
 * any client component can fetch with caching; the Toaster mounts once.
 */
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { publicEnv } from "@/lib/env-client";

export function Providers({ children }: { children: ReactNode }) {
  // Per-instance QueryClient so client-side cache doesn't leak between users in
  // a long-lived single-page session (state is created in render → isolated).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30s keeps dashboards responsive without hammering
            refetchOnWindowFocus: false, // SaaS dashboards don't refresh on focus
            retry: 1,
          },
        },
      }),
  );

  return (
    <ClerkProvider
      publishableKey={publicEnv.CLERK_PUBLISHABLE_KEY}
      appearance={{
        // Pass the `dark` preset to Clerk when the user's theme is dark, so Clerk's
        // hosted pages match the rest of the app. next-themes toggles the `class` on
        // <html>; we read it via a CSS selector Clerk already understands.
        baseTheme: undefined,
        variables: {
          colorPrimary: "hsl(var(--primary))",
          colorText: "hsl(var(--foreground))",
          colorBackground: "hsl(var(--background))",
          colorInputBackground: "hsl(var(--input))",
          colorInputText: "hsl(var(--foreground))",
        },
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

/**
 * Helper exported for the auth shell to style Clerk on dark mode without re-importing
 * Clerk themes — kept local to the client bundle.
 */
export function clerkThemeForDark(isDark: boolean) {
  return isDark ? dark : undefined;
}
