# ✅ AALM VASTRALAY — PROJECT ROADMAP & TODO
# Location: .ai/TODO.md

## Completed Tasks (Production Ready)
- [x] Full responsive Indian & Bihar ethnic design with dark/light themes.
- [x] WhatsApp direct inquiry integration on all product cards.
- [x] Dynamic UPI QR Code (₹0 gateway fee) with 5-minute security timer and 12-digit UTR verification.
- [x] 1-Click WhatsApp Order Confirmation & Bridal Sizing Consultation.
- [x] Master Vibe Coding System adopted in `.ai/PROMPTS/MASTER_SYSTEM.md`.
- [x] Open-source specialized skill library loaded into `.agent/skills/`.
- [x] Smart Catalog Visual Filters (Haldi, Mehendi, Sangeet, Wedding, Color Dots, Fabrics).
- [x] Indian Pincode Circle Resolution & Zero-Cost COD delivery estimator.
- [x] Automated CI/CD security workflows (CodeQL, Semgrep, Dependency Security, Dependabot).
- [x] 18 Automated Enterprise Test Suites in `tests/` (`npm test` passing in ~0.24s).
- [x] TypeScript Strict Mode (0 type errors, 0 `any` types).
- [x] Next.js 16 Turbopack production build with all 55 routes verified.
- [x] 16 relational database tables with Drizzle ORM and Neon Postgres.
- [x] Safe clean reset script in `scripts/neon-reset.sql` preserving categories, coupons, settings, and admin.
- [x] Multi-vendor seller portal (`/seller`) with strict tenant boundary enforcement.
- [x] Live zero-code site settings panel (`/admin/settings`) with 93 configurations.

- [x] Customer photo review uploads (UGC photo reviews with direct client upload to B2 and XSS sanitization).
- [x] GitHub Workflows Hardening (CI build fallback env, CodeQL, Semgrep SAST, NPM critical audit).
- [x] Dependabot configuration optimization (grouped PRs, @types/node LTS constraints).

- [x] Push notifications for order dispatch via Service Worker (`public/sw.js`, `src/lib/push.ts`, `PushNotificationPrompt.tsx`).
- [x] Direct Shiprocket / Delhivery courier API integration for automatic AWB label generation (`src/lib/courier/`, `GenerateAwbButton.tsx`).
- [x] Root directory cleanup & Master documentation index (`docs/README.md`, `README.md`).
- [x] Brand Identity, 20 Multi-Format Logos & Complete 53-Icon System Matrix (`public/logos/`, `public/watermarks/`, `public/`, `docs/ICONS.md`, ADR 014).
- [x] Full Route Completion (Categories, Search, Help, FAQ, Shipping, Track Order, Size Guide, Blog, Policies, Admin Suite, APIs).
- [x] Mobile Navigation Slide-Over Overhaul (full-height luxury drawer, category accordion, WhatsApp direct booking, persistent dual-mode logo).
- [x] Performance (Static/ISR) Optimization (`revalidate` on Home, Categories, Blog, Legal, Sitemap, and Manifest).
- [x] Admin Theme Editor Client Form (`ThemeEditorForm.tsx`) with real-time swatch sync & SSR safety.
- [x] Forgot Password OTP & Confirm Password form field alignment with instant verification.
- [x] Universal Google Drive link resolver supporting multi-account URLs (`/file/u/X/d/`) and direct queries.
- [x] Serverless upload fallback resilience with Backblaze B2 & Data URI fallback on Vercel.
- [x] Real-time order status revalidation on `/seller/orders`.
- [x] Mobile Bottom Navigation Dynamic Active Highlighting (`MobileTabBarClient.tsx`) with royal/gold active pill & tactile tap scale.
- [x] Admin & Seller Sidebar Active Route Highlighting (`AdminSidebarNav.tsx`, `SellerSidebarNav.tsx`) with gradient glow & gold pulse dots.
- [x] UPI Fraud Prevention: default to pending-verification, additive upi_utr DB column, strict 12-digit UTR validation, and admin 1-click verify/reject.
- [x] Zero-Cost PII Data Masking: maskPhone (+91 normalization, middle 4 masking) and maskEmail (domain preservation) across Admin & Seller views.
- [x] Free-Tier Image Optimization & Caching: wsrv.nl default quality=70 WebP conversion and 7-day immutable Cache-Control headers.
- [x] Public API XSS & Information Leak Hardening: escapeHtml on shipping labels, suppressed stack traces in /api/health, escaped JSON-LD scripts.
- [x] Zero-Cost In-Memory Rate Limiting: memoryRateLimit protecting /api/bootstrap (5/min, crypto.timingSafeEqual, POST), /api/search, /api/courier/label, /api/health.
- [x] Universal Banner Media Resolver & Webpage Scraper: interactive BannerEditor, Google Drive auto-conversion to direct lh3 CDN, SSRF-safe /api/admin/scrape-image.
- [x] Button Double-Click Chaos Defense: atomic re-entry guard hook `useFormLock()` preventing duplicate form submissions and order double-charges.
- [x] Universal Tactile Press & Click Feedback: global active scale, brightness dimming, and inset shadow across all buttons, inputs, links, and cards.
- [x] Hardened Google Apps Script Transactional Mailer: 100% free Gmail mailer in `scripts/mailer/Code.gs` with constant-time token verification, 450/day quota guard, HTML sanitization, and 7 bilingual templates.
- [x] SEO & PWA Offline Resiliency: `sitemap.ts` filtered to active in-stock products (`stock > 0`), dual-cache strategy in `public/sw.js`, and `push_subscriptions` Drizzle schema.
- [x] Luxury Email Template Redesign: Royal purple and gold gradient layout, 42px tracked OTP ticket box, clean UTF-8 headers (zero `??????` subject corruption).
- [x] Admin 1-Click Marketing Broadcast Center (`/admin/marketing`): presets for Diwali, Eid, Chhath, Wedding Season, Coupon Blasts, and Stock Alerts with live interactive preview.
- [x] Bento 2.0 Product Card Upgrade: Gold shimmer hover border, `🔥 महाबचत` savings badge, rupee savings calculation `(बचत ₹...)`, and tactile press feedback.
- [x] Production Server-Side Hardening across all 26 API routes (Anti-spoof proxy IPs, fail-closed rate limit, 0 stack/DB error leakage).
- [x] Vercel Function Invocation & Neon Query Diet (Header unstable_cache tag `site-settings`, 3-in-1 consolidated counts query, guest fast-path, targeted updateTag cache invalidation).
- [x] Turnstile-Style Click-to-Solve PoW Bot Defense (5 display modes: standard, bar, floating, overlay, invisible; 2 widget styles: checkbox, switch; 4 luxury accent themes).
- [x] Anti-Replay Security Store: `pow_used` table with atomic conflict rejection and automated 1-hour pruning.
- [x] Cellular Roaming /24 Subnet Binding: Tower drift tolerance for Indian mobile carriers with cross-network theft prevention.
- [x] 28 Automated Enterprise Test Suites in `tests/` (`npm test` passing in ~1.93s).

## In-Progress / Next Enhancements
- [ ] Post-delivery automated review request reminders via Push/WhatsApp.
- [ ] Geolocation auto-detection for Indian postal circles.


