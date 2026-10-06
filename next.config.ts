import type { NextConfig } from "next";
// package.json se version read karo — NEXT_PUBLIC_APP_VERSION ke roop mein inject hoga
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json") as { version: string; name: string };

const csp = [
  "default-src 'self'",

  // Scripts — DuckDB-Wasm WebAssembly in-browser OLAP + Analytics
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'" +
    " https://cdn.jsdelivr.net" +
    " https://upload.imagekit.io https://ik.imagekit.io" +
    " https://loglyuk.com https://plausible.io",

  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",

  // Images — specific domains (Backblaze B2 uses dynamic bucket subdomains)
  "img-src 'self' data: blob:" +
    " https://*.backblazeb2.com" +
    " https://lh3.googleusercontent.com" +
    " https://wsrv.nl" +
    " https://ik.imagekit.io https://upload.imagekit.io" +
    " https://i.imgur.com https://images.unsplash.com" +
    " https://avatars.githubusercontent.com" +
    " https://placehold.co",

  "media-src 'self' blob: https://*.backblazeb2.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://upload.imagekit.io https://ik.imagekit.io",

  // Workers — DuckDB-Wasm Web Worker needs jsdelivr + blob
  "worker-src 'self' blob: https://cdn.jsdelivr.net",
  "child-src 'self' blob: https://cdn.jsdelivr.net",

  // Network fetch — DuckDB-Wasm CDN fetches its own WASM bundles + Cloud APIs
  "connect-src 'self'" +
    " https://cdn.jsdelivr.net" +
    " https://ik.imagekit.io https://upload.imagekit.io" +
    " https://wsrv.nl" +
    " https://*.workers.dev" +
    " https://*.neon.tech" +
    " https://loglyuk.com" +
    " https://*.backblazeb2.com https://api.backblazeb2.com" +
    " https://www.googleapis.com https://oauth2.googleapis.com",

  "frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // HSTS — browser ko force karo sirf HTTPS use kare (Phase 1 quick win)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];


const nextConfig: NextConfig = {
  // Disable X-Powered-By header to prevent server technology disclosure (OWASP ZAP 10037)
  poweredByHeader: false,

  // 0. App Version — package.json se version client-side env var mein inject karo
  //    VersionBadge component isko NEXT_PUBLIC_APP_VERSION se read karta hai
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },

  // 1. Enable HTTP response compression (Brotli / Gzip)
  compress: true,

  // 2. Server external packages (Neon WebSocket / serverless)
  serverExternalPackages: ["@neondatabase/serverless"],

  // 3. Image optimization & modern formats (AVIF, WebP)
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days cache
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Cache static Next.js assets aggressively (1 year)
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache images, brand icons, and static public media assets (7 days)
        source: "/:path*\\.(svg|jpg|jpeg|png|webp|avif|ico|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
