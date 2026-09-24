# 📜 AALM VASTRALAY — PROJECT CHANGELOG
# Location: .ai/CHANGELOG.md

---

## [2026-09-24] — Master Vibe Coding System, UGC Photo Reviews, GitHub Workflows & Motion Design

### Added
- **GitHub Workflows Hardening & CI/CD Normalization (`.github/workflows/`, `.github/dependabot.yml`):**
  - `ci.yml`: Comprehensive Next.js 16 Turbopack build, lint, typecheck, and test runner with safe fallback environment variables for pull requests.
  - `codeql.yml`: CodeQL analysis for JavaScript/TypeScript with non-blocking continuous integration fallback.
  - `semgrep.yml`: Updated to official `semgrep/semgrep` Docker container for automated SAST.
  - `dependency-security.yml`: Scheduled NPM audit reporting critical security advisories without blocking on transitive dev dependencies.
  - `dependabot.yml`: Grouped dependency updates to prevent PR spam and added version ceiling for `@types/node` (< 23.0.0) ensuring LTS compatibility.
- **Customer UGC Photo Reviews (`src/components/product/ReviewForm.tsx`, `src/actions/orders.ts`):**
  - Enabled customers to upload up to 4 real product photos directly with their verified reviews.
  - Client-side presigned upload to Backblaze B2 bypassing Vercel body size limits.
  - Server-side image sanitization rejecting non-HTTP protocols, XSS injections, and capping at 4 photos.
  - Photo thumbnail previews with 1-click removal button before submission.
- **Motion Design & APCA Contrast Tokens (`src/app/globals.css`, `src/components/ProductCard.tsx`):**
  - Smooth keyframe animations (`shimmer`, `pulse-subtle`, `float-gentle`) with strict `@media (prefers-reduced-motion: reduce)` accessibility overrides.
  - Low-stock urgency pill (`⚡ Only X left`) and APCA high-contrast typography.
- **Google Schema.org JSON-LD & OpenGraph Metadata (`src/app/products/[slug]/page.tsx`, `src/app/layout.tsx`):**
  - Structured data scripts (`Product`, `BreadcrumbList`) for rich Google search snippets.
  - Configured `metadataBase` to eliminate Next.js metadata warnings.
- **Expanded Enterprise Test Suite (19/19 Suites Passing in 0.25s):**
  - `tests/unit/ugc-review.test.ts`: Verified review photo URL parsing, capping, and security sanitization.
  - `tests/unit/catalog-filters.test.ts`: Verified occasion, color, and fabric filtering rules.
  - `tests/unit/pincode-estimator.test.ts`: Verified Indian postal circle mapping and delivery calculation.

---

## [2026-09-23] — Dynamic UPI QR, 1-Click WhatsApp Commerce & Free-Tier Infrastructure Optimization

### Added
- **Dynamic UPI QR Code with Sound & 5-Minute Timer (`src/components/checkout/DynamicUpiQr.tsx`, `src/lib/upi.ts`):**
  - Real-time NPCI-compliant UPI QR generator (`upi://pay?pa=8434061342@upi&pn=Aalm+Vastralay&am=...`) with zero payment gateway commission.
  - 5-Minute countdown security timer with animated progress bar and auto-expiration state.
  - 12-Digit Indian banking UTR / UPI Reference Number verification input with instant confirmation chime (Web Audio API synthesis).
  - 1-Click mobile deep link buttons for Google Pay, PhonePe, Paytm, and BHIM.
  - Automatic attachment of UTR reference to order notes for proprietor bank reconciliation.
- **1-Click WhatsApp Order Confirmation & Bridal Consultation (`src/lib/whatsapp.ts`, `src/components/orders/WhatsAppOrderButton.tsx`, `src/components/product/WhatsAppConsultButton.tsx`, `src/components/admin/WhatsAppDispatchButton.tsx`):**
  - Instant WhatsApp Order Confirmation button on order success and order detail views with pre-filled message: `"Namaste Aalam Vastralay, maine Order #[ORDER_NUMBER] ([ITEMS]) book kiya hai. Total: ₹[TOTAL]. Please confirm kijiye."`
  - WhatsApp Bridal / Wedding Consultation & custom stitching measurement button on product detail pages.
  - 1-Click WhatsApp dispatch update button with tracking details for Admin & Sellers.
- **Neon Database Free-Tier Optimization (`src/db/index.ts`, `src/lib/db/pool.ts`):**
  - Pooled connection string enforcement (`-pooler` validation with dev warning and production error).
  - 10-Second connection timeout and 30-second idle timeout to support Neon scale-to-zero.
  - Safe performance composite indexes on `products`, `orders`, `order_items`, `reviews`, and `addresses`.
  - Edge-compatible HTTP Drizzle client export (`getHttpDb`).
- **Vercel & Edge Runtime Optimization (`src/middleware.ts`, `src/lib/auth/config.ts`):**
  - Lightweight Edge middleware skipping static assets, brand images, and public routes.
  - Zero database queries in middleware.
- **Clerk 50,000 MRU Optimization (`src/hooks/useGuestOrAuth.ts`, `src/lib/auth/cached.ts`):**
  - `useGuestOrAuth` React 19 hook with `useSyncExternalStore` for guest shopping without burning Clerk quotas.
  - React `cache()` request-scoped auth deduplication.
- **Backblaze B2 Private Storage Optimization (`cloudflare-worker/b2-proxy.js`, `workers/b2-proxy/worker.js`, `src/lib/b2.ts`, `src/lib/upload-client.ts`):**
  - Cloudflare Worker proxy script with Cloudflare KV token caching (23 hours) and 1-year immutable edge caching.
  - Presigned direct-to-B2 client upload pipeline bypassing Vercel 4.5MB serverless limits.
- **16 Enterprise Test Suites (`tests/run-all-tests.ts`):**
  - Added unit test suites: `db-pooled.test.ts`, `middleware-skip.test.ts`, `guest-mode.test.ts`, `clerk-webhook.test.ts`, `presign.test.ts`, `auth-cache.test.ts`, `upi-qr.test.ts`, and `whatsapp-integration.test.ts`.

---

## [2026-09-22] — Enterprise Test Suite & Safe Reset Architecture
### Added
- **7 Automated Enterprise Test Suites (`tests/`):**
  - `tests/encryption.test.ts`: AES-256-GCM authenticated cipher and PII phone/email masking.
  - `tests/commerce.test.ts`: Indian Lakhs/Crores currency formatting, discount math, free shipping calculation.
  - `tests/ethnic-features.test.ts`: 6-digit Indian PIN code regex, ethnic sizing ranking (XS to XXL), order step mapping.
  - `tests/auth-security.test.ts`: Scrypt password salt/hash and role integrity.
  - `tests/coupons-categories.test.ts`: Discount rules (percentage vs fixed), order minimums, max discount caps, and category hierarchies.
  - `tests/seller-privacy-isolation.test.ts`: Multi-vendor isolation verifying sellers cannot alter competitor stores.
  - `tests/admin-customization.test.ts`: All 93 zero-code settings and JSON default parsing safety.
- **Enterprise Neon SQL Script (`scripts/neon-reset.sql`):**
  - Safe clean wipe preserving categories, coupons, settings, audit logs, and admin.
  - Complete 16-table DDL recreate option with default admin, categories, and coupon seeds.
- **Vibe Coding Master Rules & Memory Engine (`.ai/`):**
  - Full `.ai/` directory structure with `RULES.md`, `CONTEXT.md`, `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `DECISIONS.md`.
