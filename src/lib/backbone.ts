/** Free-tier service catalogue shown in the admin integrations dashboard. */
type EnvLike = Record<string, string | undefined>;

export const BACKBONE: Array<{
  name: string;
  purpose: string;
  envKeys: string[];
  docs: string;
  testKey?: "neon" | "gas" | "smtp" | "b2" | "worker" | "ai";
  check: (env: EnvLike) => boolean;
}> = [
  {
    name: "Neon PostgreSQL",
    purpose: "Primary database (0.5 GB free, ap-south-1 Mumbai)",
    envKeys: ["DATABASE_URL"],
    docs: "https://neon.tech/docs",
    testKey: "neon",
    check: (env) => Boolean(env.DATABASE_URL),
  },
  {
    name: "Better Auth + GAS Email",
    purpose: "Session auth, magic links & email OTP via 100% free Gmail webhook",
    envKeys: ["AUTH_SECRET", "GAS_EMAIL_URL", "GAS_WEBHOOK_URL", "GAS_SECRET_TOKEN"],
    docs: "https://better-auth.com",
    testKey: "gas",
    check: (env) => Boolean(env.GAS_EMAIL_URL || env.GAS_WEBHOOK_URL || env.AUTH_SECRET || env.BETTER_AUTH_SECRET),
  },
  {
    name: "Direct Gmail SMTP (Primary)",
    purpose: "Direct TLS socket dispatch via nodemailer (500 emails/day free)",
    envKeys: ["SMTP_USER", "SMTP_PASSWORD", "SMTP_HOST", "SMTP_PORT"],
    docs: "https://support.google.com/mail/answer/185833",
    testKey: "smtp",
    check: (env) => Boolean(env.SMTP_USER && (env.SMTP_PASSWORD || env.SMTP_PASS || env.EMAIL_SERVER_PASSWORD)),
  },
  {
    name: "Multi-Provider AI Studio",
    purpose: "AI copywriting, product tag generation & auto-recommendations (Gemini, Groq, Mistral)",
    envKeys: ["GEMINI_API_KEY", "GROQ_API_KEY", "MISTRAL_API_KEY"],
    docs: "https://aistudio.google.com",
    testKey: "ai",
    check: (env) => Boolean(env.GEMINI_API_KEY || env.GROQ_API_KEY || env.MISTRAL_API_KEY),
  },
  {
    name: "ImageKit CDN",
    purpose: "Product images + video (20 GB bandwidth, 3 GB storage free)",
    envKeys: ["NEXT_PUBLIC_IMAGEKIT_URL", "IMAGEKIT_PRIVATE_KEY"],
    docs: "https://imagekit.io/docs",
    check: (env) => Boolean(env.NEXT_PUBLIC_IMAGEKIT_URL && env.IMAGEKIT_PRIVATE_KEY),
  },
  {
    name: "wsrv.nl image proxy",
    purpose: "Resize/optimise any external image URL (free, fair use)",
    envKeys: ["NEXT_PUBLIC_USE_WSRV"],
    docs: "https://wsrv.nl",
    check: (env) => env.NEXT_PUBLIC_USE_WSRV !== "false",
  },
  {
    name: "Backblaze B2 cold storage",
    purpose: "Private bucket for archived order media (10 GB free)",
    envKeys: ["B2_BUCKET_NAME", "B2_KEY_ID", "B2_APP_KEY"],
    docs: "https://www.backblaze.com/b2/docs/",
    testKey: "b2",
    check: (env) => Boolean(env.B2_KEY_ID && env.B2_APP_KEY),
  },
  {
    name: "Cloudflare Worker (B2 proxy)",
    purpose: "Signed-proxy + edge cache for cold images (100k req/day)",
    envKeys: ["NEXT_PUBLIC_B2_WORKER_URL"],
    docs: "https://developers.cloudflare.com/workers/",
    testKey: "worker",
    check: (env) => Boolean(env.NEXT_PUBLIC_B2_WORKER_URL),
  },
  {
    name: "quiet-mail transactional email",
    purpose: "Order confirmations & seller alerts (unlimited free)",
    envKeys: ["QUIETMAIL_API_URL", "QUIETMAIL_API_KEY"],
    docs: "https://github.com/quiet-mail",
    check: (env) => Boolean(env.QUIETMAIL_API_URL && env.QUIETMAIL_API_KEY),
  },
  {
    name: "Loglyuk / Plausible CE analytics",
    purpose: "Privacy-friendly pageview analytics (10k views free)",
    envKeys: ["NEXT_PUBLIC_LOGLYUK_DOMAIN", "NEXT_PUBLIC_ANALYTICS_SCRIPT_URL"],
    docs: "https://plausible.io/docs",
    check: (env) => Boolean(env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL && env.NEXT_PUBLIC_LOGLYUK_DOMAIN),
  },
  {
    name: "UptimeRobot monitoring",
    purpose: "Uptime checks against /api/health (50 monitors free)",
    envKeys: ["UPTIMEROBOT_API_KEY"],
    docs: "https://uptimerobot.com/api/",
    check: (env) => Boolean(env.UPTIMEROBOT_API_KEY),
  },
  {
    name: "errex / Sentry error tracking",
    purpose: "Self-hosted error capture (Sentry-SDK compatible)",
    envKeys: ["NEXT_PUBLIC_SENTRY_DSN"],
    docs: "https://docs.sentry.io/platforms/javascript/guides/nextjs/",
    check: (env) => Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
  },
  {
    name: "Cloudflare Pages hosting",
    purpose: "Unlimited bandwidth + free *.pages.dev domain",
    envKeys: ["CF_PAGES"],
    docs: "https://developers.cloudflare.com/pages/",
    check: (env) => Boolean(env.CF_PAGES ?? env.NEXT_PUBLIC_SITE_URL),
  },
];

/** Health/ops endpoints other services can call. */
export const OPS_ENDPOINTS = [
  { path: "/api/health", purpose: "Liveness + database round-trip for UptimeRobot" },
  { path: "/api/products", purpose: "Public catalogue JSON (cacheable at the edge)" },
  { path: "/api/search/suggest", purpose: "Autocomplete JSON (rate limited)" },
  { path: "/api/security/challenge", purpose: "Proof-of-work challenge issuer" },
  { path: "/api/auth/[...all]", purpose: "Better Auth endpoints (magic link, OTP, sessions)" },
];
