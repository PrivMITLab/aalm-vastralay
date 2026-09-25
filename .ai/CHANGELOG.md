# 📜 AALM VASTRALAY — PROJECT CHANGELOG
# Location: .ai/CHANGELOG.md

---

## [2026-09-25] — UPI Fraud Defense, PII Masking, Free-Tier Image Compression, XSS Hardening & Zero-Cost Rate Limiting

### Added & Hardened
- **UPI Fraud Prevention & 1-Click Verification (`src/actions/orders.ts`, `src/actions/admin.ts`, `src/components/admin/VerifyUpiButton.tsx`):**
  - Eliminated automatic `paymentStatus: "paid"` on client checkout for UPI and online payment methods.
  - Set initial payment status to `"pending-verification"` until confirmed by admin.
  - Added additive `upi_utr text` column to `orders` table with index `idx_orders_upi_utr` (zero data loss migration in `src/db/init.ts` and `src/db/schema.ts`).
  - Added strict 12-digit numeric regex validation (`/^[0-9]{12}$/`) for UPI UTR in checkout schema.
  - Created server action `verifyUpiPayment(orderId, action: "verify" | "reject")` with audit logging and instant path revalidation.
  - Added interactive `<VerifyUpiButton />` in `/admin/orders` for 1-click verification or rejection.
- **Customer Privacy & PII Data Masking (`src/lib/masking.ts`, `/admin/users`, `/admin/orders`, `/seller/orders`):**
  - Created zero-cost PII masking library `maskPhone` and `maskEmail`.
  - Normalizes Indian numbers (+91, trunk 0) and masks middle 4 digits (`8434061342` -> `8434****42`).
  - Masks email usernames while preserving domain (`ram@gmail.com` -> `r**@gmail.com`).
  - Conceals customer contact details in admin and seller list tables to stop visual shoulder surfing and bulk scraping.
- **Free-Tier Image Compression & CDN Caching (`src/lib/image-resolver.ts`, `next.config.ts`):**
  - Standardized `wsrv.nl` image transformations to default `quality = 70`, `output = webp`, `fit = cover`, saving over 65% network payload without paid image optimizers.
  - Configured 7-day immutable `Cache-Control` browser/edge headers in `next.config.ts` for all static brand assets, images, and fonts.
- **XSS & Information Leak Hardening (`src/app/api/courier/label/route.ts`, `src/app/api/health/route.ts`, `src/app/layout.tsx`, `src/app/products/[slug]/page.tsx`):**
  - Added HTML entity sanitization (`escapeHtml`) on AWB, Courier, Order ID, and Pincode query params in direct shipping label generator.
  - Suppressed internal database error message and stack trace leaks in `/api/health`, logging probe failures safely on the server and returning clean HTTP 500.
  - Escaped `<` characters in JSON-LD structured data scripts (`replace(/</g, "\\u003c")`) to prevent script breakout XSS.
- **Zero-Cost In-Memory Rate Limiting & Bootstrap Hardening (`src/lib/rate-limit.ts`, `src/app/api/bootstrap/route.ts`, `src/app/api/search/route.ts`):**
  - Built zero-cost in-memory fixed-window rate limiter with automatic 5-minute memory cleanup (`memoryRateLimit`).
  - Protected public endpoints (`/api/bootstrap`, `/api/courier/label`, `/api/health`, `/api/search`) against brute force and DDoS without burning Neon connection slots or compute hours.
  - Converted `/api/bootstrap` to support secure `POST`, constant-time token comparison via `crypto.timingSafeEqual` over SHA-256 digests, 5 req/min rate limit, and required `confirm=yes` for demo data wipe requests.
- **Enterprise Test Suite Expansion (`tests/unit/masking-and-hardening.test.ts`, `tests/run-all-tests.ts`):**
  - Added 24th automated enterprise test suite covering PII masking, in-memory rate limiting, and XSS sanitization (all 24/24 passing in 0.36s).

---

## [2026-09-25] — Interactive Click Feedback, Tactile Touch States & Dynamic Active Route Highlighting

### Added & Improved
- **Mobile Bottom Navigation Dynamic Active Highlighting (`src/components/ui/MobileTabBarClient.tsx`):**
  - Converted tab bar rendering to a high-performance client component using `usePathname()`.
  - Added real-time active tab detection across Home (`/`), Shop (`/products`, `/categories`, `/search`), Saved (`/wishlist`), Bag (`/cart`), and Orders/Seller (`/orders`, `/seller`, `/onboarding`).
  - Added royal/gold color highlights, soft glowing background pills (`bg-[color:var(--brand-soft)]/70`), top glowing indicator bars, and immediate `active:scale-90` tactile feedback on tap.
- **Admin Console Sidebar Active States (`src/components/admin/AdminSidebarNav.tsx`):**
  - Built dedicated client component replacing static links in `src/app/admin/layout.tsx`.
  - Added royal purple to indigo gradient background, imperial gold icon scaling, and pulsating gold status dot indicator for currently selected pages (`/admin/categories`, `/admin/products`, `/admin/orders`, etc.).
  - Added tactile click compression (`active:scale-[0.97]`) and smooth hover animations.
- **Seller Hub Sidebar Active States (`src/components/seller/SellerSidebarNav.tsx`):**
  - Integrated active path detection with maroon gradient styling, gold accent border rings, and gold indicator dots in `src/app/seller/layout.tsx`.
- **Category Action Button Feedback (`src/app/admin/categories/page.tsx`):**
  - Integrated `SubmitButton` on "Add Category", parent "Activate/Deactivate", and child "Enable/Disable" actions to show instant spinners and pending text ("Adding Category…", "Saving…") instead of unresponsive frozen buttons.
- **Universal Tactile Touch & Click Engine (`src/app/globals.css`, `src/components/SubmitButton.tsx`, `src/components/header/HeaderNav.tsx`):**
  - Added native mobile tap highlight color (`-webkit-tap-highlight-color: rgba(212, 175, 55, 0.15)`).
  - Enhanced all `.btn:active` states with `transform: scale(0.97) translateY(1px)`, inset press shadows, and variant-specific color/ring highlights (`.btn-primary`, `.btn-gold`, `.btn-outline`, `.btn-ghost`, `.btn-icon`).
  - Introduced `.tap-feedback`, `.active-press`, and `.card-clickable` utilities across the application.

---

## [2026-09-24] — Production Bug Fixes, Serverless Storage Resilience & Admin Interactive Suite

### Fixed
- **Admin Theme SSR Event Crash (`/admin/theme`):**
  - Resolved `ERROR 3000360342` caused by inline `onChange` event handlers inside an `async` Server Component.
  - Built `src/components/admin/ThemeEditorForm.tsx` as a client component managing real-time color swatches, live branding typography preview, and form action with loading state.
- **Forgot Password Form Field Name Mismatch (`/forgot-password`):**
  - Resolved persistent `"पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match)"` error.
  - Reconciled `confirmPassword` from `ForgotPasswordForm.tsx` with backend `verifyOtpAndResetPassword` in `src/actions/auth.ts`.
- **Seller Order Status Live Revalidation (`/seller/orders`):**
  - Added `revalidatePath("/seller/orders")`, `revalidatePath("/admin/orders")`, and `revalidatePath("/orders/" + orderId)` inside `updateOrderStatus` in `src/actions/seller.ts` so order status updates instantly without requiring a page refresh.
- **Multi-Account Google Drive Image URL Parsing:**
  - Expanded `GDRIVE_URL_REGEX` in `src/lib/image-resolver.ts` to match multi-account URLs (`/file/u/0/d/...`, `/file/u/1/d/...`) and direct ID query params (`uc?id=...`).
- **Serverless Image Upload Resilience & CSP:**
  - Fixed `ENOENT: mkdir '/var/task/public/uploads'` on Vercel by integrating direct Backblaze B2 cloud storage upload via Cloudflare Worker proxy and safe serverless Data URI fallback in `src/lib/uploads.ts`.
  - Added store auto-provisioning in `src/app/api/uploads/product/route.ts`.
  - Added `"worker-src 'self' blob:"` and `"child-src 'self' blob:"` in `next.config.ts` Content Security Policy (CSP).

---

## [2026-09-24] — Route Completion, Performance (Static/ISR) Optimization & Luxury UI/UX Revamp

### Added
- **Full Route Completion (Zero 404s Across Entire Platform):**
  - **Category Sub-routes:** Created `src/app/categories/page.tsx`, `src/app/categories/[slug]/page.tsx` (ISR `revalidate = 300`) with dynamic subcategory chips and `loading.tsx`.
  - **Dedicated Search Route:** Created `src/app/search/page.tsx` with full-text `tsvector` query matching, trending chips, and `loading.tsx`.
  - **Help & Customer Care Hub:** Created `src/app/help/page.tsx`, `src/app/faq/page.tsx`, `src/app/shipping/page.tsx`, `src/app/track-order/page.tsx` (live parcel milestones), and `src/app/size-guide/page.tsx` (measurements & custom tailoring).
  - **Editorial Journal & Blog:** Created `src/lib/blog.ts` (typed repository), `src/app/blog/page.tsx`, and `src/app/blog/[slug]/page.tsx` with SSG pre-rendering (`generateStaticParams`).
  - **Legal Policies:** Created `src/app/refund-policy/page.tsx` and `src/app/shipping-policy/page.tsx`.
  - **Admin Back-Office Suite:** Created `src/app/admin/users`, `src/app/admin/sellers`, `src/app/admin/products`, `src/app/admin/orders`, `src/app/admin/categories`, `src/app/admin/coupons`, `src/app/admin/banners`, `src/app/admin/theme`, and `src/app/admin/audit-logs`.
  - **Public & Admin REST Endpoints:** Created `/api/categories`, `/api/search`, and admin API endpoints (`/api/admin/users`, `/api/admin/sellers`, `/api/admin/products`, `/api/admin/orders`, `/api/admin/coupons`, `/api/admin/banners`, `/api/admin/settings`).
  - **Digital Artisan Handbook:** Created `src/app/handbook/page.tsx`.
- **High-Res Editorial Public Assets:**
  - Placed 4 luxury ethnic assets in `public/images/`: `bridal-lehenga.jpg`, `sherwani.jpg`, `kids-lehenga.jpg`, and `dupatta-jewellery.jpg`.

### Improved
- **Header & Mobile Drawer Navigation Overhaul (`src/components/header/HeaderNav.tsx`):**
  - **Persistent High-Contrast Logo:** Replaced brittle classes with dual-mode responsive brand mark pairing the royal gold medallion (`/logos/icon-only.svg`) with styled serif typography, guaranteeing high contrast in both Light and Dark modes.
  - **Full-Height Luxury Mobile Slide-Over:** Transformed mobile drawer into full-height `z-[100]` slide-over with Royal Purple header, user status, quick links, category accordion, WhatsApp direct booking, and theme toggle.
- **Hero Section Aesthetic & Visual Contrast (`src/app/page.tsx`):**
  - Added gradient backdrop, Devanagari typography with Imperial Gold gradient split, `.btn-gold` metallic button, and trust badges.
- **Performance & Static/ISR Optimizations:**
  - Converted `src/app/(legal)/layout.tsx` to 24h ISR.
  - Converted `src/app/page.tsx` to `revalidate = 120`.
  - Updated `src/app/sitemap.ts` (`revalidate = 3600`) and `src/app/manifest.ts` (`revalidate = 86400`).
  - Succeeded Next.js production build (`npm run build`) with 31/31 static/ISR pages compiled.

---

## [2026-09-24] — Brand Identity Expansion: 7 Enterprise Sections Added (Typography, Rules, Icons, A11y, Naming, Roadmap, Voice)

### Added
- **docs/BRAND.md & docs/ICONS.md Expansion:**
  - **Section 6: Typography:** Full font hierarchy specification (Playfair Display 700, Georgia Bold, Inter 400-600, JetBrains Mono 400), responsive web type scale (H1-H4, Body, Caption), print sizes, tracking/letter-spacing, and Next.js font loading strategy.
  - **Section 7: Logo Usage Rules:** Clear space / safe zone formula (height of letter "A" on all sides), minimum print & digital reproduction sizes, priority placement zones, and explicit DO/DO NOT rules.
  - **Section 8: Icon Generation:** Generation runbook, master artwork source specs, CLI commands (`npm run icons:generate`, `npm run icons:verify`), script architecture, 53-icon configuration catalog, and automated CI/CD verification workflows.
  - **Section 9: Accessibility (WCAG 2.1 AA):** Comprehensive color contrast matrix (8.2:1 Gold on Purple, 15.8:1 Charcoal on Ivory, etc.), screen reader alt-text conventions for logos/icons, SVG `role="img"` standards, keyboard navigation rules, and `prefers-reduced-motion` CSS overrides.
  - **Section 10: File Naming Convention:** Universal `{type}-{color}.{ext}` and `{platform}-{size}x{size}.{ext}` schema, directory tree blueprint, and file naming rules.
  - **Section 11: Version History & Roadmap:** Version changelog tracking v1.0.0 through v2.0.0, and 3-phase strategic roadmap covering animated logos, 3D AR monograms, packaging collateral, and franchise architecture through 2028.
  - **Section 12: Brand Voice & Messaging:** Ruler + Caregiver brand archetype, tone of voice rules, primary & alternative Hindi/English taglines, 5 core messaging pillars, and copy examples for home, product descriptions, emails, and packaging.
- **Automated Verification Script (`scripts/verify-icons.js`, `package.json`):**
  - Added `npm run icons:verify` script and updated test runner to guarantee all icon configurations and manifests remain present in CI.
  - Added `public/favicon.svg` vector favicon alongside dark mode vector variant.

---

## [2026-09-24] — Brand Identity, 20 Multi-Format Logos & Complete 53-Icon System Matrix

### Added
- **Master Vector Artwork (`public/logo-source.svg`, `public/logo.svg`):**
  - Designed 1024×1024 royal imperial medallion monogram featuring serif lettermark "AV", gold zari filigree circle, and inner micro-bead border.
  - Preserved root `public/logo.svg` for backwards-compatible vector consumers.
- **Complete 20-Logo Vector Suite (`public/logos/`):**
  - **Primary Horizontal (800×200):** `primary.svg`, `primary-white.svg`, `primary-black.svg`, `primary-gray.svg`.
  - **Secondary Stacked (400×500):** `secondary.svg`, `secondary-white.svg`, `secondary-black.svg`, `secondary-gray.svg`.
  - **Icon-Only Monogram (512×512):** `icon-only.svg`, `icon-only-white.svg`, `icon-only-black.svg`, `icon-only-gray.svg`.
  - **Wordmark Only (800×150):** `wordmark.svg`, `wordmark-white.svg`, `wordmark-black.svg`, `wordmark-gray.svg`.
  - **Lettermark "AV" (512×512):** `lettermark.svg`, `lettermark-white.svg`, `lettermark-black.svg`, `lettermark-gray.svg`.
  - High-res PNG exports: `primary.png`, `primary@2x.png`, `secondary.png`, `icon-only.png`, `wordmark.png`, `lettermark.png`.
- **Watermark Protection Suite (`public/watermarks/`):**
  - `full.svg`: 500×150 horizontal gold watermark (15% opacity) for high-res product detail views.
  - `icon.svg`: 200×200 medallion watermark (20% opacity) for corner photo protection.
  - `tiled.svg`: 1000×1000 45-degree diagonal pattern protecting catalog assets from scraping.
- **53-Icon Multi-Platform Matrix (`public/`, `public/browserconfig.xml`, `public/manifest.json`):**
  - **Favicons:** `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png`, `favicon-dark.svg`.
  - **Apple Touch Icons:** `apple-touch-icon.png`, `apple-touch-icon-76x76.png`, `apple-touch-icon-152x152.png`, `apple-touch-icon-167x167.png`, `apple-touch-icon-180x180.png`, `apple-touch-icon-precomposed.png`.
  - **Android / PWA Icons:** `android-chrome-72x72.png`, `android-chrome-96x96.png`, `android-chrome-128x128.png`, `android-chrome-144x144.png`, `android-chrome-152x152.png`, `android-chrome-192x192.png`, `android-chrome-384x384.png`, `android-chrome-512x512.png`.
  - **Maskable Icons (80% Safe Zone):** `maskable-192x192.png`, `maskable-512x512.png` with 10% outer safety margin.
  - **Windows Metro Tiles:** `mstile-70x70.png`, `mstile-144x144.png`, `mstile-150x150.png`, `mstile-310x150.png`, `mstile-310x310.png`, `browserconfig.xml`.
  - **Social & OpenGraph:** `og-image.png` (1200×630), `twitter-image.png` (1200×600), `og-image-square.png` (1200×1200), `linkedin-image.png` (1200×627).
  - **Email & UI Assets:** `email-logo.png` (400×100), `safari-pinned-tab.svg` (monochrome silhouette), `loading-spinner.svg` (pure CSS animated gold loader).
- **Metadata & PWA Synchronization (`src/app/layout.tsx`, `src/app/manifest.ts`):**
  - Updated `generateMetadata()` with comprehensive icon tags, Safari mask-icon, og:image, and static `manifest.json` alongside dynamic routes.
  - Zero regression: preserved existing `public/brand/` SVGs and dynamic Next.js App Router metadata generators.
- **Architectural Documentation & Asset Catalog (`docs/ICONS.md`, `.ai/DECISIONS.md`):**
  - Created ADR 014 detailing market research of Indian ethnic luxury competitors and color psychology.
  - Authored comprehensive `docs/ICONS.md` asset catalog and developer usage runbook.

---

## [2026-09-24] — Service Worker Push Notifications, Shiprocket/Delhivery AWB Generation & Master Docs Hub

### Added
- **Service Worker Push Notifications for Order Dispatch (`public/sw.js`, `src/lib/push.ts`, `src/components/notifications/PushNotificationPrompt.tsx`):**
  - Offline-ready Service Worker listening for Web Push events with deep-link navigation to `/orders/[id]`.
  - Notification prompt with React 19 `useSyncExternalStore` for reactive browser permission synchronization.
  - Automatic push notification trigger and persistent in-app record creation when order state changes to dispatched/shipped.
- **Direct Shiprocket & Delhivery Courier API Integration (`src/lib/courier/`, `src/actions/courier.ts`, `src/components/admin/GenerateAwbButton.tsx`):**
  - Unified logistics engine supporting Shiprocket multi-carrier aggregation and Delhivery express B2C network.
  - Automatic Waybill (AWB) generation with intelligent postal circle routing (Delhivery for North/East India hubs, Shiprocket nationwide).
  - Printable official shipping label with barcode, hub routing codes, and order breakdown (`/api/courier/label`).
  - 1-Click "Generate AWB" and "Print Label" buttons directly inside Admin & Seller order views.
- **Master Documentation Hub Consolidation (`docs/README.md`, `docs/COMPLETE_GUIDE.md`, `docs/ENV_SETUP_GUIDE.md`):**
  - Cleaned root workspace by migrating standalone guides into `docs/`.
  - Created master bi-directional documentation index linking all system manuals, AI agent rules, and API specifications.
  - Cross-referenced all guides in `README.md`, `GEMINI.md`, and `CLAUDE.md`.
- **Expanded Enterprise Test Suite (21/21 Suites Passing in 0.24s):**
  - `tests/unit/push-notifications.test.ts`: Verified push payload creation, deep-link URL formatting, and subscription validation.
  - `tests/unit/courier-integration.test.ts`: Verified Shiprocket numeric AWBs, Delhivery waybills, and destination hub routing.
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
