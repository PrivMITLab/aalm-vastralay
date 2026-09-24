# 🧠 AALM VASTRALAY — LIVE APP CONTEXT
# Location: .ai/CONTEXT.md

## 1. Project Overview
- **Project Name:** Aalm Vastralay (आलम वस्त्रालय) — Marketplace Platform
- **Owner / Proprietor:** Suheb Alam (Kalyanipur, Bihar, India)
- **Primary Domain:** Indian Ethnic Wear Marketplace (Sarees, Lehengas, Sherwanis, Kurta Sets, Dupattas, Jewellery)
- **Architecture:** Next.js 16 (App Router + Turbopack) + Drizzle ORM + Neon Serverless PostgreSQL + Tailwind CSS + Lucide React

## 2. Current Verified Status (Production Ready)
- **Build Status:** Next.js 16 Turbopack build passes with 0 errors (`npm run build`, all 55 routes compiled).
- **TypeScript Status:** Strict mode enabled, 0 type errors (`npm run typecheck`).
- **ESLint Status:** Clean, 0 errors / 0 warnings (`npm run lint`).
- **Automated Tests:** 21 Enterprise test suites in `tests/` passing in ~0.24s (`npm test`).
- **Git Branch:** `main` (Remote: `https://github.com/alamwastraly-sketch/aalm-vastralay.git`).
- **GitHub Workflows:** `ci.yml`, `codeql.yml`, `semgrep.yml`, `dependency-security.yml`, `deploy.yml`, and `dependabot.yml` configured and hardened.
- **Documentation Hub:** Root clean with all guides centralized in `docs/README.md`.

## 3. High-Value Indian Commerce Features
1. **Shiprocket & Delhivery Direct Logistics & AWB Generation:**
   - Multi-carrier auto-routing: Delhivery Express for North/East India (Bihar/UP/Delhi hubs), Shiprocket nationwide.
   - 1-Click AWB generation and printable packing slip with Code128 barcodes (`/api/courier/label`).
2. **Service Worker Push Notifications for Order Dispatch:**
   - Offline-ready `public/sw.js` with deep-link click routing to `/orders/[id]`.
   - Customer opt-in prompt with React 19 `useSyncExternalStore` permission synchronization.
   - Automatic dispatch push and in-app alerts on courier dispatch.
3. **Dynamic UPI QR Code (Zero Payment Gateway Fee):**
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
- **Backblaze B2 Private Storage:** Cloudflare Worker proxy script (`cloudflare-worker/b2-proxy.js`) with Cloudflare KV token caching (23 hours) and 1-year immutable edge caching; presigned direct client upload pipeline.
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
