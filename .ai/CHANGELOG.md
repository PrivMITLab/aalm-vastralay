# 📜 AALM VASTRALAY — PROJECT CHANGELOG
# Location: .ai/CHANGELOG.md

---

## [2026-09-24] — Master Vibe Coding System, Catalog Visual Filters, Indian Pincode Estimator & CI/CD Security Workflows

### Added
- **Master Vibe Coding System Adoption (`.ai/PROMPTS/MASTER_SYSTEM.md`, `.agent/skills/`):**
  - Stored comprehensive production-grade prompt in `.ai/PROMPTS/MASTER_SYSTEM.md`.
  - Added specialized skill definitions in `.agent/skills/` (`ui-ux-pro-max`, `motion-design`, `vibe-security`, `vibe-security-audit`, `agentic-seo`, `web-quality-skills`, `vibe-proof`).
  - Added reusable prompt guides: `.ai/PROMPTS/SEO_AUTONOMOUS.md`, `.ai/PROMPTS/ICON_GENERATION.md`, `.ai/PROMPTS/ENTERPRISE_QUALITY.md`.
- **Smart Catalog Visual Filters (`src/lib/catalog-filters.ts`, `src/app/products/page.tsx`):**
  - **Wedding & Festive Occasions:** Haldi Ceremony (💛), Mehendi Night (🌿), Sangeet Glam (✨), Wedding & Baraat (👑), Reception & Cocktail (🥂), Festive & Puja (🪔).
  - **Visual Color Dots / Swatches:** 9 color swatches with hover scale and selected ring indicator (Red, Maroon, Mustard Yellow, Emerald Green, Rani Pink, Royal Blue, Pastel Peach, Royal Gold, Classic Black).
  - **Fabric Filter:** Pure Silk, Banarasi, Georgette, Royal Velvet, Chiffon, Organza, Chanderi, Pure Cotton.
  - **Active Filter Chips Bar:** 1-Click removal pills with "Clear all" action.
- **Indian Pincode Circle Resolution & Delivery Estimator (`src/lib/pincode.ts`, `src/components/product/PincodeEstimator.tsx`):**
  - Intelligent prefix-based mapping across all Indian postal circles (Delhi NCR, UP, Bihar, Maharashtra, Rajasthan, South, and North-East).
  - Circle / State badge with Express Hub indicator for metro circles.
  - Zero-Cost Cash on Delivery badge and Free Shipping indicator.
- **Automated CI/CD & Security Workflows (`.github/workflows/`):**
  - `codeql.yml`: GitHub Actions automated CodeQL security analysis for JavaScript/TypeScript.
  - `semgrep.yml`: Semgrep security scanning for automated SAST.
  - `dependency-security.yml`: Scheduled NPM audit checks for dependency vulnerabilities.
  - `dependabot.yml`: Automated weekly dependency update scans.
  - `CODEOWNERS` & `ISSUE_TEMPLATE/security_report.md`: Coordinated vulnerability disclosure and repository ownership.
- **GEO / AEO Search Support (`public/llms.txt`, `docs/ICONS.md`):**
  - AI engine readable store catalog and serviceability description.
- **Expanded Enterprise Test Suite (18/18 Suites Passing in 0.24s):**
  - `tests/unit/catalog-filters.test.ts`: Verified occasion, color, and fabric filtering rules.
  - `tests/unit/pincode-estimator.test.ts`: Verified Indian postal circle mapping, delivery calculation, and COD rules.

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
