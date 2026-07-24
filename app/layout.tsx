/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Root layout: the outermost Server Component that every page inherits. It provides:
 *  - Metadata (title template, description, OpenGraph defaults for SEO)
 *  - The ClerkProviders wrapper (app/providers) for client-side auth + query
 *  - The `<html>` and `<body>` with `suppressHydrationWarning` for next-themes
 *    (the theme class is toggled on <html> by a client-side script to avoid FOUC).
 *  - Font loading: Geist Sans + Geist Mono are optimized via Next's `next/font`
 *    so they're inlined as CSS variables, not external HTTP fetches.
 */
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers/providers";
import { GlobalSplineBackground } from "@/components/ui/global-spline-background";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | SupportIQ",
    default: "SupportIQ — AI Customer Support That Actually Helps",
  },
  description:
    "Create, train, and embed an AI-powered customer support assistant for your business. Understand your customers, reduce response time, and capture leads — all in one place.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "SupportIQ — AI Customer Support That Actually Helps",
    description:
      "Create, train, and embed an AI-powered customer support assistant for your business.",
    type: "website",
    siteName: "SupportIQ",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SupportIQ",
    description: "AI-powered customer support for modern businesses.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-black font-sans antialiased">
        <GlobalSplineBackground />
        <div className="relative z-10 pointer-events-none min-h-dvh flex flex-col [&_header]:pointer-events-auto [&_footer]:pointer-events-auto [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto [&_textarea]:pointer-events-auto [&_[role='button']]:pointer-events-auto">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
