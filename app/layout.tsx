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
import localFont from "next/font/local";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const GeistSans = localFont({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const GeistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

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
      <body className="min-h-dvh bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
