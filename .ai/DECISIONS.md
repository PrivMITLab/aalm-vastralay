# 💡 AALM VASTRALAY — ARCHITECTURAL DECISION RECORDS (ADR)
# Location: .ai/DECISIONS.md

---

## ADR 001: Next.js 16 App Router & Turbopack
- **Status:** Accepted
- **Decision:** Build the entire frontend and backend within Next.js 16 using App Router and Turbopack compiler.
- **Rationale:** Delivers sub-second hot reloading, Server Components for lightning-fast First Contentful Paint, and unified full-stack deployments on Cloudflare / Node runtimes.

## ADR 002: Neon Serverless PostgreSQL with Drizzle ORM
- **Status:** Accepted
- **Decision:** Use Neon PostgreSQL over Prisma or Mongo.
- **Rationale:** True serverless autoscaling with zero-idle cold starts, SQL standard relational integrity, foreign key cascades, and Drizzle's lightweight zero-overhead query compilation.

## ADR 003: Zero-Code Dynamic Admin Settings
- **Status:** Accepted
- **Decision:** Store customizable website parameters (brand colors, hero banners, announcements, currency, shipping fees) in a relational `settings` table with in-memory caching.
- **Rationale:** Empowers the business owner / admin to change promotional banners, seasonal colors, and contact info instantly without needing a developer or code deployment.

## ADR 004: Strict Multi-Vendor Scoping for Sellers
- **Status:** Accepted
- **Decision:** Filter all seller catalog and order modifications strictly by `storeId = ownStore.id`.
- **Rationale:** Guarantees absolute commercial privacy between marketplace vendors.

## ADR 005: Neon Pooled Connection Enforcement
- **Status:** Accepted
- **Decision:** Validate all database connections against `-pooler` hostname in serverless production and fail early if a direct connection is configured.
- **Rationale:** Serverless functions exhaust Neon's 20-connection cap within minutes under concurrent traffic. Pooled connections multiplex through PgBouncer handling 10,000+ connections smoothly.

## ADR 006: Lightweight Edge Middleware & Static Asset Skipping
- **Status:** Accepted
- **Decision:** Remove all database and heavy crypto imports from middleware; skip static assets, brand images, and public pages.
- **Rationale:** Keeps Edge middleware bundle < 500KB and invocation time < 10ms, conserving Vercel 1M invocations free quota.

## ADR 007: Private Backblaze B2 via Cloudflare Worker Proxy
- **Status:** Accepted
- **Decision:** Keep B2 bucket completely private; proxy media through Cloudflare Worker with 1-year immutable cache (`Cache-Control: public, max-age=31536000, immutable`).
- **Rationale:** Bandwidth Alliance provides $0 egress fees between B2 and Cloudflare. Edge caching ensures B2 is queried only once per asset globally.

## ADR 008: Dynamic Zero-Commission UPI QR with UTR Verification
- **Status:** Accepted
- **Decision:** Provide direct dynamic UPI QR code generator (`upi://pay?...`) with pre-filled order total and 5-minute timer at checkout, alongside 12-digit banking UTR verification.
- **Rationale:** Eliminates 2% payment gateway surcharge and GST deductions; funds transfer directly to the proprietor's verified bank account instantly, while decreasing COD return rates (RTO) by up to 40%.

## ADR 009: 1-Click WhatsApp Order Confirmation & Bridal Consultation
- **Status:** Accepted
- **Decision:** Add 1-click pre-filled WhatsApp links for customer order confirmations, custom bridal/stitching consultations, and admin/seller dispatch notifications.
- **Rationale:** Over 90% of Indian ethnic wear customers use WhatsApp for sizing verification, blouse measurement consultation, and delivery coordination.

## ADR 010: Master Vibe Coding System & Local Skill Ecosystem
- **Status:** Accepted
- **Decision:** Adopt the Master Vibe Coding System with specialized skills cataloged under `.agent/skills/` (`ui-ux-pro-max`, `motion-design`, `vibe-security`, `vibe-security-audit`, `agentic-seo`, `web-quality-skills`, `vibe-proof`) and reusable operational prompts under `.ai/PROMPTS/`.
- **Rationale:** Standardizes cross-agent best practices for design intelligence, animation choreography, full-stack defensive security, and SEO while maintaining zero regression and strict TypeScript quality.

## ADR 011: Smart Visual Catalog Filters & Indian Postal Circle Estimation
- **Status:** Accepted
- **Decision:** Implement multi-dimensional visual filters on `/products` (Wedding/Festive occasions, visual color dots with selected ring state, and ethnic fabrics) and Indian postal circle lookup in `src/lib/pincode.ts`.
- **Rationale:** Enhances ethnic discovery (shoppers search specifically by "Haldi", "Mehendi", or "Rani Pink") and provides immediate delivery confidence and Cash on Delivery reassurance to Indian shoppers.

## ADR 012: Offline-Ready Service Worker Push Notifications for Order Dispatch
- **Status:** Accepted
- **Decision:** Implement browser Service Worker (`public/sw.js`) and React 19 `useSyncExternalStore` prompt for instant dispatch notifications with deep-link click routing to `/orders/[id]`.
- **Rationale:** Traditional SMS/WhatsApp gateways incur per-message costs and rate limits. Browser Web Push notifications are 100% free, instantaneous, and provide rich tactile notifications even when the browser tab is closed.

## ADR 013: Direct Shiprocket & Delhivery Logistics Engine with Multi-Carrier Auto-Routing
- **Status:** Accepted
- **Decision:** Build a unified courier engine integrating both Delhivery B2C surface/express APIs and Shiprocket multi-carrier aggregation, with intelligent postal prefix routing (Delhivery for North/East India, Shiprocket nationwide) and printable Code128 barcode labels.
- **Rationale:** Streamlines merchant fulfillment to a single click, eliminating manual portal data entry, reducing dispatch errors, and generating official carrier waybills instantly.

## ADR 014: Wedding & Ethnic Wear Brand Identity System, Multi-Format Logos & 53-Icon Architecture
- **Status:** Accepted
- **Context:**
  A comprehensive market research study was conducted analyzing top Indian ethnic/wedding wear market leaders (Myntra Luxe, Nykaa Fashion, Tata CLiQ Luxury, Ajio Luxe, Jaypore, Craftsvilla) and global luxury bridal platforms (BHLDN, Net-a-Porter, Farfetch, Revolve).
- **Market Research Findings:**
  1. **Logo Style (Heritage Monogram + High-Kerning Wordmark):**
     - Premium ethnic houses utilize a dual-tier identity: A circular medallion monogram paired with a balanced, high-kerning serif wordmark.
     - Pure sans-serif wordmarks feel too generic/tech-like for wedding couture, while script-heavy logos fail legibility at < 32px favicon sizes.
     - Optimal Architecture: An "AV" / "आ" serif monogram framed in a royal coin medallion, coupled with "AALM VASTRALAY" in refined Roman proportions.
  2. **Color Psychology & Cultural Resonance:**
     - **Imperial Gold (`#D4AF37` / `#C9A227`):** Represents auspiciousness, *shagun*, zardozi embroidery, and timeless wedding prosperity.
     - **Deep Royal Purple & Burgundy (`#4A148C` / `#4D1420`):** Evokes royal Banarasi silk, velvet sherwanis, and luxury bridal trousseau.
     - **Rich Heritage Maroon (`#800020` / `#7A1F2B`):** The quintessential Indian bridal hue symbolizing marriage and celebration.
     - **Warm Silk Cream (`#FFF8E7` / `#FFFBF5`):** Soft, non-glare background providing an opulent canvas.
     - **Contrast Compliance:** All primary combinations exceed WCAG 2.1 AAA (7:1+ contrast ratio) and APCA contrast thresholds.
  3. **Typography Standards:**
     - Logo & Brand Display: Georgia / Playfair Display / Cormorant Garamond serif with elegant ascenders and tight tracking.
     - UI, Pricing & Navigation: Inter / system-ui sans-serif for instantaneous micro-readability across Indian mobile networks.
  4. **Iconography & Library Selection:**
     - Standard: Lucide React (outline, 2px stroke, rounded terminals).
     - Rationale: Eliminates all unthemed system emojis, delivers pixel-perfect alignment across 16px/20px/24px grids, and tree-shakes cleanly into Next.js bundles.
  5. **Cross-Platform Icon Hierarchy (53 Asset Types):**
     - Modern PWA, iOS Safari, Android Chrome, Windows Metro tiles, and social platforms require specific asset matrices (favicon.ico, Apple touch icons, maskable 80% safe zone PWA icons, OpenGraph 1200x630, Twitter cards, and email headers).
- **Decision:**
  - Create the 1024x1024 master vector source (`public/logo-source.svg`).
  - Generate all 5 logo variants (Primary, Secondary Stacked, Icon-Only Monogram, Wordmark, Lettermark) across 4 color schemes (Full Color, Reversed White, Monochrome Black, Grayscale).
  - Generate 3 watermark variations (Full, Icon, Tiled 45-degree repeat) for product photo protection.
  - Implement the complete 53-icon asset suite across browser favicons, Apple touch, Android PWA, Windows tiles, and social cards without deleting or modifying any existing asset.

## ADR 015: Zero-Budget Server Hardening, Anti-Spoof Rate Limiting & Fail-Closed Protection
- **Status:** Accepted
- **Decision:** Validate all incoming IP addresses against strict IPv4/IPv6 regex, enforce verified proxy priority (`cf-connecting-ip` when `TRUST_PROXY === "1"`, else direct socket IP), quarantine malformed IPs to a strictly throttled `"unknown"` bucket, and fail-closed on sensitive authentication and payment routes if rate-limiting throws.
- **Rationale:** Free-tier deployments are vulnerable to IP header spoofing and brute-force credential stuffing. Failing closed guarantees unauthorized attackers cannot bypass security checks during database spikes.

## ADR 016: Self-Hosted Turnstile-Style Click-to-Solve PoW Defense with /24 Subnet Binding
- **Status:** Accepted
- **Decision:** Replace third-party anti-bot services (Google reCAPTCHA / Cloudflare Turnstile) with an in-house, zero-cost PBKDF2 Web Worker solver featuring 5 display modes, 2 widget controls, 4 luxury themes, atomic single-use challenge store (`pow_used`), and `/24` IPv4 / `/64` IPv6 subnet drift tolerance.
- **Rationale:** Eliminates vendor lock-in, recurring API fees, and privacy tracking while preserving user experience for Indian mobile network users roaming between cellular towers. Client-side submit locks combined with server-side validation completely neutralize inspect-element bypasses.

## ADR 017: Next.js 16 Caching Strategy & Neon Query Diet
- **Status:** Accepted
- **Decision:** Cache Header site settings and commerce configuration using `unstable_cache` with tag `site-settings` (revalidate 3600s), combine user counts into a single consolidated SQL query, bypass queries entirely for guest users, and replace indiscriminate `revalidatePath("/", "layout")` calls with targeted `updateTag()` invalidation.
- **Rationale:** Prevents excessive serverless function invocations and preserves Neon compute hours on Hobby/Free plans, dropping logged-out page view database hits from multiple round-trips to zero on warm cache.

## ADR 018: Privacy-First Avatar Display — User ID as Seed (Never Email or Name)
- **Status:** Accepted
- **Decision:** Use `user.id` (UUID, never email or name) as the DiceBear Lorelei avatar seed everywhere — header trigger (size 28), dropdown (size 36), mobile drawer (size 36), and dashboard (size 112).
- **Rationale:** Email-as-seed would make a hashed/derivable version of PII visible in the SVG request URL (`/api/avatar?seed=...`). UUID is opaque and contains no reversible PII. Avatar is deterministic (same user always gets same face) without any upload friction. Open-source safe: user ID is meaningless without the database.

## ADR 019: Open-Source-Safe Cloudflare Worker Template with One-Command CLI Setup
- **Status:** Accepted
- **Decision:** The committed `cloudflare-worker/wrangler-b2-proxy.toml` uses placeholder values (`SETUP_SCRIPT_WILL_FILL_THIS`) for `account_id` and KV namespace `id`. Actual values are written at runtime by `scripts/setup-b2-worker.ps1` (Windows) / `.sh` (Mac/Linux). B2 credentials (`B2_KEY_ID`, `B2_APP_KEY`) are piped directly to `wrangler secret put` — never stored in any file, shell variable, log, or git history.
- **Rationale:** Committing a real `account_id` allows enumerating or targeting specific Cloudflare accounts. The one-command script approach makes the project safe to open-source while maintaining zero-friction setup for new operators. All secrets live exclusively in Cloudflare's encrypted secrets vault.

## ADR 020: Backblaze B2 Class C Elimination via PostgreSQL `media_assets` Caching & Hard Delete
- **Status:** Accepted
- **Decision:** Cache uploaded asset metadata and B2 version ID (`fileId`) in Neon PostgreSQL table `media_assets`. Gallery listing queries read directly from PostgreSQL with zero B2 API invocations. File deletions call native `b2_delete_file_version` using `fileId` instead of standard S3 `DeleteObject`.
- **Rationale:** Backblaze B2 free tier permits 2,500 Class C calls/day. Calling `b2_list_file_names` or creating hidden tombstone markers rapidly exhausts this limit. Database caching drops Class C listing calls to absolute zero, while `b2_delete_file_version` permanently purges objects without creating tombstones.

## ADR 021: Universal Multi-Source Media Selector & Master Setup Wizard
- **Status:** Accepted
- **Decision:** Provide `UniversalMediaPicker.tsx` supporting B2 upload, Google Drive direct share link embedding (canonicalized via `lh3.googleusercontent.com/d/{id}` for zero-cost media), web links, and DB-cached gallery with 1-click delete. Provide `scripts/setup-env.ps1` (`npm run setup:env`) with 1-click Vercel CLI synchronization.
- **Rationale:** Gives non-technical store owners flexible media sourcing options without burning cloud storage limits, while making environment setup entirely automated and zero-friction.

## ADR 022: DuckDB-Wasm Client-Side In-Memory OLAP Analytics & Statutory GST Slicing
- **Status:** Accepted
- **Decision:** Deploy `@duckdb/duckdb-wasm` in a dedicated Web Worker on `/admin/analytics` and `/seller/analytics`. Neon PostgreSQL serves a 5-minute cached, non-PII dataset export (`/api/admin/analytics/dataset` and `/api/seller/analytics/dataset`). DuckDB ingests rows into virtual columnar tables (`orders`, `items`) to execute GMV trends, ethnic category share, payment velocity, and statutory 5% vs 12% apparel GST slab calculations in-memory. Provide a Super Admin interactive SQL console with CSV export.
- **Rationale:** Neon PostgreSQL free tier (0.5 GB) must be reserved for transactional OLTP writes. Running heavy multi-month `GROUP BY` aggregations repeatedly on Neon burns compute units and can starve connection pools. Offloading analytical queries to client-side DuckDB-Wasm results in **0% Neon compute load, 0 Vercel server execution costs**, and sub-millisecond query performance on the user's browser.

## ADR 023: Fail-Closed Secrets Architecture & Zero Hardcoded Fallbacks
- **Status:** Accepted
- **Decision:** Replace all inline fallback strings (`|| "aalm_gas..."`, `?? "aalm-vastralay..."`) with a centralized fail-closed `getRequiredEnv(key)` gateway in `src/lib/required-env.ts`. Any missing or empty required secret in production throws an immediate `[FATAL]` error causing the process to fail-closed. In development (`NODE_ENV !== "production"`), emit a visible warning and use an ephemeral mock fallback. Google Apps Script mailers strictly enforce `PropertiesService.getScriptProperties().getProperty("AUTH_TOKEN")` without fallback defaults.
- **Rationale:** Eliminates silent security degradation, credential drift, and accidental reliance on mock tokens in production deployments. Ensures all environments are explicitly configured.

## ADR 024: Automated Release Management & Strict Quality Gate Pipeline
- **Status:** Accepted
- **Decision:** Implement Google's `release-please` v4 for automated semantic versioning, Git tagging, and changelog generation, driven strictly through GitHub Actions (`.github/workflows/release.yml`). Enforce a 5-stage Quality Gate (`npm ci`, `typecheck`, `lint`, `38 test suites`, `next build`) before release evaluation. Lock version increments in `0.x.x` via `bump-minor-pre-major: true`. Enforce Conventional Commits locally via Husky hooks (`pre-commit` and `commit-msg`) and `commitlint`.
- **Rationale:** Guarantees zero-defect releases for solo and multi-developer environments, prevents broken tags or failed deployments from reaching production, and automates historical changelog tracking without manual overhead.

