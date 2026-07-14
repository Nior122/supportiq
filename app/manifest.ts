/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Web app manifest for PWA support. Lets users "install" SupportIQ to their
 * home screen / dock with a branded icon and standalone window. Generated at
 * build time at /manifest.webmanifest.
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SupportIQ",
    short_name: "SupportIQ",
    description:
      "AI-powered customer support platform. Create, train, and embed intelligent chatbots.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    categories: ["Business", "Productivity", "Customer Support"],
  };
}
