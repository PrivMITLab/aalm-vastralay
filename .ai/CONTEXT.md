# 🧠 AALM VASTRALAY — LIVE APP CONTEXT
# Location: .ai/CONTEXT.md

## 1. Project Overview
- **Project Name:** Aalm Vastralay (आलम वस्त्रालय) — Marketplace Platform
- **Owner / Proprietor:** Suheb Alam (Kalyanipur, Bihar, India)
- **Primary Domain:** Indian Ethnic Wear Marketplace (Sarees, Lehengas, Sherwanis, Kurta Sets, Dupattas, Jewellery)
- **Architecture:** Next.js 16 (App Router + Turbopack) + Drizzle ORM + Neon Serverless PostgreSQL + Tailwind CSS + Lucide React

## 2. Current Verified Status (Production Ready)
- **Build Status:** Next.js 16 Turbopack build passes with 0 errors (`npm run build`, all routes compiled).
- **TypeScript Status:** Strict mode enabled, 0 type errors (`npm run typecheck`).
- **ESLint Status:** Clean, 0 errors / 0 warnings (`npm run lint`).
- **Automated Tests:** 27 Enterprise test suites in `tests/` passing in ~0.39s (`npm test`).
- **Git Branch:** `main` (Remote: `https://github.com/alamwastraly-sketch/aalm-vastralay.git`).
- **GitHub Workflows:** `ci.yml`, `codeql.yml`, `semgrep.yml`, `dependency-security.yml`, `deploy.yml`, and `dependabot.yml` configured and hardened.
- **Documentation Hub:** Root clean with all guides centralized in `docs/README.md`.

## 3. Production Server-Side Security Hardening (All 26 API Routes)
1. **Rate-Limit Bypass & Anti-Spoof Defense (`src/lib/rate-limit.ts`, `src/lib/request.ts`):**
   - Strict IPv4 and IPv6 format regex validation (`isValidIp`). Malformed and spoofed IPs are trapped into an `"unknown"` bucket with strict limits.
   - Verified proxy header priority: `cf-connecting-ip` (when behind CF or `TRUST_PROXY === "1"`), `x-vercel-forwarded-for` / `x-real-ip`, leftmost validated IP of `x-forwarded-for`.
   - Fail-Closed Defense: Sensitive routes (auth, OTP, uploads, admin) fail-closed (`ok: false`) if the database rate-limit check throws, blocking brute-force attacks during database degradation.
   - RFC-Compliant 429 Responses: Standard response helper `rateLimitResponse` returns `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-Request-Id`.
2. **Zero-Information Leakage Guarantee:**
   - 100% elimination of `err.message`, `err.stack`, `tablesError`, and secret environment variable names from client responses across all 26 endpoints.
   - Standardized generic user-facing error messages paired with detailed server-side `console.error` tagged with unique `X-Request-Id` (`crypto.randomUUID()`).
   - `/api/diagnostic`: Restricted to admin role (`requireRole(["admin"])`) and stripped of `hasDbUrl` and `nodeEnv` exposures.
   - `/api/health`: Stripped to `{ ok: true/false }` with standard 429 headers and zero internal error traces.
   - `/api/bootstrap`: Enforced POST-only (GET returns 405 Method Not Allowed), timingSafeEqual verification, and complete elimination of `tablesError`.
3. **Edge Middleware & Anti-Bypass Protection (`src/middleware.ts`):**
   - Static-Asset Bypass Prevention: Protected routes (`/admin`, `/seller`, `/account`, `/checkout`, `/api/admin`) are guaranteed to never be bypassed by static extension trickery (e.g. `/admin/users.png`).
   - Session Token Verification: Validates 3-part structure, UUIDv4 user ID, signature format, and non-expired timestamp at the edge prior to downstream execution.
   - API 401 JSON Response: Direct API calls without valid authentication receive `{ success: false, error: "Unauthorized access" }` (401) instead of HTML redirects.
4. **Upload, Webhook & Database Hygiene:**
   - Path Traversal & MIME Hardening: `validateUploadMetadata()` strictly rejects directory traversal (`..`, `/`, `\`), enforces MIME allowlist, and caps uploads to 5MB.
   - Webhook Freshness & Soft Delete: `/api/webhooks/clerk` validates Svix signatures, enforces timestamp freshness (≤ 5 minutes), parses payloads safely with Zod, and performs soft deletion (`is_active = false`) to guarantee zero data loss.
   - Database Optimization: Full-text search index `idx_products_fts` added to DDL; immutable audit logs preserved permanently from deletion.

## 4. High-Value Indian Commerce & Zero-Loss Security Features
1. **Admin 1-Click Marketing Broadcast Center & Luxury Email Engine:**
   - Dedicated marketing dashboard at `/admin/marketing` supporting 1-click campaign presets for Diwali, Eid, Chhath, Wedding Season, Coupon Blasts, and Stock Alerts.
   - Multi-channel delivery across Email, In-App Notifications, and Web Push.
   - Live interactive email & notification preview.
   - Upgraded Google Apps Script mailer with clean UTF-8 headers (eliminates `??????` subject corruption) and royal gold & purple luxury responsive templates.
2. **Bento 2.0 Product Card Luxury Upgrade:**
   - Gold shimmer hover border, `🔥 महाबचत` savings badge, rupee savings calculator `(बचत ₹...)`, urgency stock badges, and smooth tactile tap scaling.
3. **Button Double-Click Chaos Defense & Universal Tactile Feedback:**
   - Atomic re-entry guard hook `useFormLock()` in `src/lib/use-form-lock.ts` prevents rapid double-clicks and order race conditions.
   - Enhanced `<SubmitButton />` with `aria-disabled`, `min-h-[44px] min-w-[44px]` touch target, `Loader2` spin indicator, and `pointer-events-none` when pending.
   - Global tactile click feedback in `src/app/globals.css` (`scale(0.97)`, brightness shift, inset shadow, distinct card press state).
2. **Hardened Google Apps Script (GAS) Mailer (`scripts/mailer/Code.gs`):**
   - 100% free transactional email service for Gmail without requiring custom domain DNS verification.
   - Constant-time secret token check, 450/day quota safety guard, dynamic HTML escaping, and 7 bilingual email templates.
3. **Universal Banner Media Resolver, Google Drive Auto-Conversion & Webpage Scraper:**
   - Real-time interactive Banner Editor (`src/components/admin/BannerEditor.tsx`) with live preview, fallback protection, and tactile save state.
   - `canonicalizeImageUrl` in `src/lib/image-resolver.ts` automatically converts Google Drive links (`drive.google.com/file/d/.../view`, etc.) to direct high-speed `https://lh3.googleusercontent.com/d/{id}` CDN streams and normalizes Dropbox, GitHub, and OneDrive links.
   - Secure SSRF-protected `/api/admin/scrape-image` endpoint with 1-click "Auto-Detect / Scrape" to extract OpenGraph banners from arbitrary web URLs.
   - Preserves announcement ticker and marquee settings in `SETTINGS_FIELDS` under `group: "home"`.
2. **Zero-Loss UPI Fraud Prevention & Admin 1-Click Verification:**
   - Orders placed via UPI / Online payment default to `paymentStatus: "pending-verification"`.
   - Strict 12-digit numeric regex validation (`/^[0-9]{12}$/`) for Indian banking UPI UTR in checkout.
   - Stored in additive `orders.upi_utr` column with index `idx_orders_upi_utr`.
   - Admin 1-Click Verify (`verifyUpiPayment`) or Reject button with full audit log trails.
2. **Zero-Cost PII Data Masking (`src/lib/masking.ts`):**
   - Automatically sanitizes and masks customer phone numbers (`8434061342` -> `8434****42`) and emails (`ram@gmail.com` -> `r**@gmail.com`) across Admin Users, Admin Orders, and Seller Orders.
   - Shields customer privacy and defends against shoulder surfing and bulk scrapers.
3. **Zero-Cost In-Memory Rate Limiting (`src/lib/rate-limit.ts`):**
   - In-memory fixed-window rate limiter with automatic 5-minute memory sweep.
   - Defends public endpoints (`/api/bootstrap`, `/api/courier/label`, `/api/health`, `/api/search`) against brute force and DDoS without burning Neon connection slots or compute hours.
4. **Shiprocket & Delhivery Direct Logistics & AWB Generation:**
   - Multi-carrier auto-routing: Delhivery Express for North/East India (Bihar/UP/Delhi hubs), Shiprocket nationwide.
   - 1-Click AWB generation and printable packing slip with Code128 barcodes (`/api/courier/label`).
5. **Service Worker Push Notifications for Order Dispatch:**
   - Offline-ready `public/sw.js` with deep-link click routing to `/orders/[id]`.
   - Customer opt-in prompt with React 19 `useSyncExternalStore` permission synchronization.
   - Automatic dispatch push and in-app alerts on courier dispatch.
6. **Dynamic UPI QR Code (Zero Payment Gateway Fee):**
   - Real-time NPCI UPI QR code generator (`upi://pay?pa=8434061342@upi&pn=Aalm+Vastralay&am=...`) with exact order amount.
   - 5-Minute countdown security timer with progress bar and auto-expiration state.
   - 12-Digit Indian banking UTR / UPI Reference Number verification input with Web Audio API celebratory chime.
   - 1-Click deep link launch for Google Pay, PhonePe, Paytm, and BHIM on mobile devices.
   - Saves direct 2% gateway commission and GST deductions straight to proprietor account.
2. **1-Click WhatsApp Order Confirmation & Bridal Consultation:**
   - Pre-filled WhatsApp Order Confirmation message on checkout completion and order detail views.
   - Wedding / Bridal consultation & custom stitching measurement button on product detail pages.
   - 1-Click WhatsApp dispatch update button with tracking details for Admin & Sellers.
3. **Smart Catalog Visual Filters:**
   - Occasion selector: Haldi (💛), Mehendi (🌿), Sangeet (✨), Wedding (👑), Reception (🥂), Festive (🪔).
   - 9 Visual Color Swatches / Dots filter with active selection rings.
   - Fabric filter: Pure Silk, Banarasi, Georgette, Velvet, Chiffon, Organza, Chanderi, Cotton.
   - Active filter chips bar with 1-click removal.
4. **Indian Pincode Circle Resolution & Delivery Estimator:**
   - Instant prefix-based postal circle detection across India (Delhi NCR, UP, Bihar, West, South, North East).
   - Expected delivery window calculation and zero-cost Cash on Delivery confirmation.
5. **Universal Media Engine:**
   - 6-Stage priority auto-detection pipeline supporting ImageKit, Backblaze B2, Google Drive Direct IDs, Google Drive Share links, YouTube streaming videos, and direct web URLs via wsrv.nl WebP compression.

## 4. Infrastructure & Free-Tier Optimization
- **Neon Database:** Pooled connection string (`-pooler`) enforcement with 10s connection timeout and 30s idle timeout; composite indexes on frequently filtered columns.
- **Vercel Edge:** Lightweight middleware skipping static assets and public routes; zero database queries in middleware.
- **Clerk Auth:** `useGuestOrAuth` React 19 hook for guest browsing/cart without burning 50,000 MRU quotas; React `cache()` request-scoped deduplication.
- **Backblaze B2 Private Storage:** Cloudflare Worker proxy (`https://aalm-b2-proxy.alamwastraly.workers.dev` via `cloudflare-worker/b2-proxy.js`) with Cloudflare KV token caching (23 hours) and 1-year immutable edge caching; direct serverless fallback to Data URI when on read-only environments.
- **CI/CD Security:** Automated CodeQL analysis, Semgrep scanning, and NPM dependency security checks.

## 5. Database Schema (16 Tables)
1. `users`: Customers, Sellers, and Admins (`clerk_id`, `email`, `role`, `password_hash`).
2. `stores`: Multi-vendor stores with Bihar/Indian address, GSTIN, ratings, and sales.
3. `categories`: 18 hierarchical ethnic categories (Women, Men, Kids, Accessories).
4. `products`: Catalog items with generated discount percentages, stock, weight, tags, SKU.
5. `product_variants`: Size (XS to XXL), color, price adjustment, inventory per variant.
6. `orders`: Orders with status tracking, payment methods (COD, Online, UPI), address snapshot, and UPI UTR in notes.
7. `order_items`: Line items linked to products & variants with frozen purchase price.
8. `cart`: User cart items with variant specification.
9. `wishlist`: Customer favorite ethnic pieces.
10. `reviews`: Verified purchase ratings (1-5 stars) with photos and body.
11. `coupons`: Discount vouchers (percentage/fixed) with `min_order_value` and `max_discount` caps.
12. `notifications`: Real-time user alert feed.
13. `addresses`: Customer shipping addresses with default flag.
14. `settings`: 93 zero-code admin settings for banners, theme, brand, pricing, and toggles.
15. `audit_logs`: Administrative action audit trails with IP and user agent.
16. `login_attempts` & `rate_limits`: Brute-force lockout and IP throttling.

## 6. Brand Identity & Complete Asset Matrix (ADR 014)
- **Master Vector Source:** `public/logo-source.svg` (1024×1024 master canvas) and `public/logo.svg`.
- **Logo Suite (20 SVGs + 6 PNGs in `public/logos/`):**
  - 5 Logo Styles: Primary Horizontal (800×200), Secondary Stacked (400×500), Icon-Only Monogram (512×512), Wordmark (800×150), Lettermark "AV" (512×512).
  - 4 Colorways: Full Color (Royal Purple `#4A148C` + Imperial Gold `#D4AF37`), Reversed White, Monochrome Black, Neutral Grayscale.
- **Watermark Suite (`public/watermarks/`):** Full horizontal (15% opacity), Icon corner (20% opacity), and 45-degree tiled repeat (8% opacity).
- **Complete 53-Icon Suite (`public/`):** Browser favicons (`favicon.ico`, 16x16, 32x32, 96x96, `favicon-dark.svg`), Apple touch icons (76x76, 152x152, 167x167, 180x180, precomposed), Android PWA icons (72x72 to 512x512), Maskable adaptive icons (192x192, 512x512 with 80% safe zone), Windows tiles (70x70 to 310x310 with `browserconfig.xml`), OpenGraph social cards (1200x630, 1200x600, 1200x1200, 1200x627), transactional email logo (400x100), and animated gold loading spinner.
- **PWA & Browser Fallbacks:** `public/manifest.json` static fallback alongside dynamic `src/app/manifest.ts`. Zero regression on existing `public/brand/` SVGs.
