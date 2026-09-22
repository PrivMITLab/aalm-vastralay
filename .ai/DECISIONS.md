# 💡 AALM VASTRALAY — ARCHITECTURAL DECISION RECORDS (ADR)
# Location: .ai/DECISIONS.md

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
