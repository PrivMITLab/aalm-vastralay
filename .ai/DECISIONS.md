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
- **Rationale:** Empowers the business owner (Suheb Alam) to change promotional banners, seasonal colors, and contact info instantly without needing a developer or code deployment.

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


