/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Generates /robots.txt at build time using Next.js' metadata file convention.
 * Allows search engines to crawl the public marketing pages while blocking
 * the authenticated dashboard and embed routes.
 */
import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api", "/embed", "/onboarding"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
