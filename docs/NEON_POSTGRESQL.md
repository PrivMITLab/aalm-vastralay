# 🐘 Neon Serverless PostgreSQL — Master Production Database Guide
**Location:** `docs/NEON_POSTGRESQL.md`  
**Provider:** Neon Serverless PostgreSQL ([console.neon.tech](https://console.neon.tech))  
**Engine:** PostgreSQL 16 (Serverless Autoscaling)  
**Primary Region:** `Asia-Pacific (Mumbai) - ap-south-1` (AWS)  
**ORM:** Drizzle ORM with `@neondatabase/serverless` connection pooler

---

## 📌 Architecture & Serverless Connection Topology

Neon provides a modern, serverless architecture that separates storage from compute. Because serverless runtimes (like Vercel and Edge Functions) spin up and tear down hundreds of ephemeral instances simultaneously, connecting directly to PostgreSQL can exhaust connection limits.

Aalm Vastralay utilizes Neon's **built-in PgBouncer connection pooler** (`-pooler` suffix) to multiplex thousands of serverless requests over a small, persistent set of physical database connections.

```mermaid
flowchart TD
    subgraph Vercel Serverless Fleet
        F1[Next.js Serverless Function #1]
        F2[Next.js Serverless Function #2]
        Fn[Next.js Serverless Function #N]
    end

    subgraph Neon Cloud ap-south-1 Mumbai
        Pooler[Neon Serverless Connection Pooler\nep-xxxxxx-pooler.ap-south-1.aws.neon.tech\nPort: 5432 / Session & Transaction Pooling]
        Compute[Autoscaling Postgres 16 Compute Engine\n0.25 to 2 CU Autoscaling]
        Storage[(Neon Distributed Storage Engine\nMulti-AZ High Availability)]
    end

    F1 -->|Pooled Connection| Pooler
    F2 -->|Pooled Connection| Pooler
    Fn -->|Pooled Connection| Pooler

    Pooler --> Compute
    Compute --> Storage
```

---

## 🔑 Direct vs. Pooled Connection Strings

Neon provides two distinct connection URLs. Understanding when to use each is critical for zero-downtime production stability:

| Connection Type | URL Pattern | When to Use in Production | Behavior |
|:---|:---|:---|:---|
| **Pooled Connection** *(Mandatory for Web)* | `postgresql://user:pass@ep-cool-flower-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require` | Set as `DATABASE_URL` in Vercel, Next.js API routes, Server Actions, and Auth. | Multiplexes traffic via PgBouncer. Handles sudden surges of concurrent shoppers without crashing. |
| **Direct Connection** *(Migrations / DDL)* | `postgresql://user:pass@ep-cool-flower-xxxxxx.ap-south-1.aws.neon.tech/neondb?sslmode=require` | Interactive CLI sessions, heavy schema DDL migrations, long transactions. | Bypasses PgBouncer; connects directly to PostgreSQL compute. Limited concurrent slots. |

> [!CAUTION]
> Never set a direct connection string (without `-pooler`) in Vercel's `DATABASE_URL`. Doing so will trigger `FATAL: remaining connection slots are reserved for non-replication superuser connections` during traffic spikes.

---

## 🏛️ Schema Architecture (17 Core Production Tables)

The marketplace schema is managed via Drizzle ORM (`src/db/schema.ts`):

```text
Database: neondb (PostgreSQL 16)
├── Identity & Access
│   ├── users                 # Customers, sellers, delivery agents, super-admins
│   ├── login_attempts        # Brute-force & rate-limiting tracking
│   └── addresses             # Customer shipping & billing addresses
├── Product Catalog
│   ├── categories            # 18 Ethnic wear taxonomies (Saree, Lehenga, Kurta, etc.)
│   ├── products              # Master catalog items with pricing, tags, fabric metadata
│   ├── product_variants      # Size, color, SKU, and physical inventory counts
│   └── media_assets          # B2 metadata cache (Zero Class C transactions)
├── Vendor & Stores
│   └── stores                # Verified merchant profiles, GSTIN, store banners
├── Checkout & Orders
│   ├── cart                  # Persistent guest & authenticated shopping baskets
│   ├── wishlist              # Saved customer items
│   ├── orders                # Master order records (UPI, COD, NetBanking)
│   └── order_items           # Line items with historical price snapshots
├── Engagement & Loyalty
│   ├── reviews               # Customer ratings & photo verification
│   ├── coupons               # Promo vouchers, discounts, and expiration rules
│   └── notifications         # Push & in-app alerts for shipments and offers
├── Security & Audit
│   ├── pow_used              # Anti-replay Proof-of-Work challenge hashes
│   ├── audit_logs            # Tamper-evident admin & security action logs
│   ├── rate_limits           # Sliding window IP and subnet rate limit counters
│   └── settings              # Live store settings & configuration key-values
```

---

## 🛡️ Zero-Loss Auto-Migration Protocol

Aalm Vastralay enforces a strict **Zero-Data-Loss Law** (`docs/RULES.md` Rule #1). Destructive operations like `DROP TABLE` or `DROP COLUMN` are forbidden in production migrations.

### How Non-Destructive Migrations Work (`scripts/db-auto-migrate.ts`):
1. **Additive Schema Synchronization:**
   ```sql
   CREATE TABLE IF NOT EXISTS "media_assets" (...);
   ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "fabric_care" text DEFAULT 'Dry Clean Only';
   CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products" ("category_id");
   ```
2. **Deterministic Backfilling:**
   - Essential system rows (18 ethnic categories, super-admin account, core settings) are inserted using `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE`.
3. **Execution Command:**
   ```bash
   # Run auto-migration from local machine or CI/CD
   npm run db:migrate
   # or
   npx tsx scripts/db-auto-migrate.ts
   ```

---

## 🚀 One-Time Production Bootstrap Endpoint

When deploying to Vercel for the first time, you do not need to install `psql` locally. You can initialize the database schema via a cryptographically secured HTTP POST request:

### Windows (PowerShell):
```powershell
Invoke-RestMethod -Method Post -Uri "https://aalmvastralay.com/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c&clean=true"
```

### Linux / macOS (cURL):
```bash
curl -X POST "https://aalmvastralay.com/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c&clean=true"
```

**Security Guarantees:**
- Rejects all `GET`, `PUT`, `DELETE` methods (returns 405 Method Not Allowed).
- Validates `BOOTSTRAP_TOKEN` with constant-time equality check.
- Initializes all 17 tables and indexes idempotently without affecting existing records.

---

## 🧹 Clean Wipe of Demo Data (`scripts/neon-reset.sql`)

Before opening your store to real buyers, you may want to purge test orders, mock products, and fake user reviews without deleting categories, coupons, or store configuration.

Run [`scripts/neon-reset.sql`](../scripts/neon-reset.sql) in the **Neon SQL Editor**:

```sql
BEGIN;

-- 1. Safely purge test transactional data
TRUNCATE TABLE 
  "order_items", "orders", "reviews", "cart", "wishlist",
  "product_variants", "products", "notifications", "addresses",
  "audit_logs", "login_attempts", "rate_limits", "stores"
CASCADE;

-- 2. Remove all non-admin demo users
DELETE FROM "users" WHERE "role" != 'admin';

-- 3. Confirm super-admin is intact
INSERT INTO "users" ("clerk_id", "email", "full_name", "phone", "role", "password_hash")
VALUES (
  'super_admin_primary',
  'admin@example.com',
  'Store Administrator',
  '0000000000',
  'admin',
  'd4a9603f905c065f479a81b37ebf5139:41d99908cf8eb4793fdf6c63a5aa1cb9c1ec13efbaee69c2777f98ee09bb7b0f6991ee767c29367ff1cb85cb52fbc9470c184c8a2ce477ad5a24aa76c8c9a59a'
)
ON CONFLICT ("email") DO UPDATE SET "role" = 'admin';

COMMIT;
```

**Result:** All 18 categories, coupons, admin settings, and your super-admin credentials are 100% preserved. Test products and mock reviews are reset to 0.

---

## 🌿 Neon Git-Like Database Branching for Preview Environments

Neon allows creating instant, copy-on-write database branches for PR previews and staging environments:

1. In the Neon Console, go to **Branches** -> **Create Branch**.
2. **Branch Name:** `preview-pr-test`
3. **Parent:** `main` (instant snapshot at 0 additional storage cost).
4. Assign the resulting connection string to your Vercel Preview environment variable `DATABASE_URL`.
5. Run migrations safely on the branch without touching production customer data!

---

## 📊 Performance Tuning & Production Metrics

1. **Auto-Suspension:** Free tier computes suspend after 5 minutes of inactivity. First queries wake the database in ~500ms. In production, configure **Compute Size: 0.5 CU** with **Auto-suspend disabled (Always On)** or set to 60 minutes for instant zero-latency responses.
2. **Point-in-Time Recovery (PITR):** Neon automatically takes continuous incremental backups. You can restore your database to any second within the retention window directly from the Neon Console.
3. **SSL Requirement:** Every connection requires `?sslmode=require` in the connection string to enforce TLS 1.3 encryption in transit.
