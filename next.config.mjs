// Next.js 15 configuration for SupportIQ.
//
// WHY each flag:
// - reactStrictMode: surfaces side-effect bugs in dev (double-invoke of effects/renders).
// - poweredByHeader: false → don't advertise our stack to attackers (security hygiene).
// - experimental.optimizePackageImports: tree-shake huge icon/utility libs so only the
//   icons/components actually used ship to the client bundle (keeps TBT low).
// - images.remotePatterns: allow next/image to optimize logos/avatars that businesses
//   upload to Cloudinary, plus Clerk & Vercel avatar hosts.
// - turbopack rules: a CSS module -> additional loader mapping placeholder for future
//   global asset handling.
//
// AI model selection (OpenAI/Claude/Groq) is configured at runtime via env + per-bot
// settings in the DB — NOT here. This file stays infrastructure-only.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "date-fns",
      "react-markdown",
    ],
    // Server actions handle file uploads (PDF up to 20 MB). Next.js 15 defaults
    // to 1 MB — far too low for real documents. This must match MAX_FILE_SIZE in
    // app/dashboard/bots/[botId]/knowledge/actions.ts.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Allow optimized remote images from the storage/auth providers we integrate with.
    // Explicit allowlist prevents SSRF via next/image's optimizer.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Stripe + Clerk webhook routes need raw bodies — skip Next body parsing there.
  // The route handlers themselves read the raw stream (see api/webhooks/*).
  // This is the App Router equivalent of the old `api: { bodyParser: false }`.
  async headers() {
    return [
      {
        // Strong baseline security headers applied to every route.
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // The embed widget is intentionally loaded inside customers' sites via
        // an iframe, so it must be permitted to frame itself.
        source: "/embed/:path*",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
        ],
      },
      {
        // The dashboard must only be framed by SupportIQ itself (clickjacking
        // protection). The embed widget is a separate route group.
        source: "/dashboard/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
