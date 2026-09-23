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
