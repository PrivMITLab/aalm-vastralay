# 🗄️ AALM VASTRALAY — DATABASE & ZERO-LOSS MIGRATION GUIDE
# Location: .ai/DATABASE.md

## 1. Golden Principle: ZERO DATA LOSS ON UPDATES

Jab bhi aap koi naya feature add karte hain ya existing feature update karte hain, **PURANA DATA KABHI BHI DESTROY NAHI HONA CHAHIYE**.

### The 3 Rules of Safe Database Migration:

### Rule 1: "Expand & Contract Pattern" (Additive-Only Changes)
- **KABHI BHI** existing column ko seedhe `RENAME` ya `DROP` na karein.
- **HAMESHA** naya column `ADD COLUMN IF NOT EXISTS ... DEFAULT ...` ke sath add karein:
  ```sql
  -- ✅ SAHI TAREEKA:
  ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "fabric_care" text DEFAULT 'Dry Clean Only';
  ```
- Purana code purane columns ko padhta rahega aur naya code naye column ko use karega. Kuchh bhi crash nahi hoga.

### Rule 2: "Non-Destructive Defaults"
- Koi bhi naya column add karte waqt `NOT NULL` bina `DEFAULT` value ke na lagayein:
  - ❌ `ALTER TABLE "orders" ADD COLUMN "gift_wrap" boolean NOT NULL;` -> **Crash! (Purane rows me error aayega)**
  - ✅ `ALTER TABLE "orders" ADD COLUMN "gift_wrap" boolean DEFAULT false NOT NULL;` -> **Safe! (Purane rows me automatically `false` chala jayega)**

### Rule 3: "Soft Deletes instead of Hard Deletes"
- Live e-commerce me kabhi bhi records ko hard `DELETE` na karein agar unka historical connection hai:
  - Product delete hone par: `UPDATE products SET is_active = false WHERE id = ...;`
  - User disable hone par: `UPDATE users SET is_active = false WHERE id = ...;`
  - Isse purane orders, invoices, aur financial reports hamesha intact rahenge.

---

## 2. Table Catalog (All 19 Tables)

| Table | Purpose | Primary Key | Foreign Keys |
|---|---|---|---|
| `users` | Customer, Seller, and Admin accounts | UUID | — |
| `stores` | Multi-vendor seller storefronts | UUID | `owner_id -> users.id` |
| `categories` | Ethnic categories & subcategories | UUID | `parent_id -> categories.id` |
| `products` | Ethnic wear apparel listings | UUID | `store_id -> stores.id`, `category_id -> categories.id` |
| `product_variants`| Sizing (XS-XXL) & color inventory | UUID | `product_id -> products.id` |
| `orders` | Customer purchases & statuses | UUID | `customer_id -> users.id`, `store_id -> stores.id` |
| `order_items` | Products within an order | UUID | `order_id -> orders.id`, `product_id -> products.id` |
| `cart` | Shopping cart items | UUID | `user_id -> users.id`, `product_id -> products.id` |
| `wishlist` | Saved favorite products | UUID | `user_id -> users.id`, `product_id -> products.id` |
| `reviews` | Customer ratings, photos & `helpful_count` | UUID | `product_id -> products.id`, `user_id -> users.id` |
| `review_votes` | Anti-gaming single-use helpful upvotes | UUID | `review_id -> reviews.id`, `user_id -> users.id` |
| `media_assets` | Backblaze B2 metadata & fileId cache (0 Class C) | UUID | `store_id -> stores.id` |
| `coupons` | Promo codes & discounts | UUID | — |
| `notifications` | User alerts feed (`priority`, `channel_id`, `action_buttons`) | UUID | `user_id -> users.id` |
| `addresses` | Customer delivery locations | UUID | `user_id -> users.id` |
| `settings` | Zero-code site customizations | Text (key) | `updated_by -> users.id` |
| `audit_logs` | Admin action trail | UUID | `actor_id -> users.id` |
| `login_attempts` | Brute force defense logs | UUID | — |
| `rate_limits` | IP request throttling | Text (key) | — |
| `pow_used` | Single-use PoW anti-replay challenge store | Text (`challenge_hash`) | — |

---

## 3. Pure Production & Zero-Fake Data Policy
- **No Mock / Fake Reviews:** The platform strictly enforces Indian Standard **BIS IS 19000:2022** for Online Consumer Reviews. Only verified customers who ordered and received a product (`status IN ('delivered', 'confirmed')`) can write reviews.
- **Customer Review CRUD & Helpful Voting:** Customers have full rights to Edit and Delete their reviews at any time. Crowd-sourced helpful votes are persisted in `review_votes` with IP hash anti-gaming checks.
- **Statement-Level Isolated Auto-Migration:** In `src/db/init.ts`, `autoEnsureTables()` executes each `ALTER TABLE` and `CREATE TABLE` inside its own isolated `try/catch` block so transient errors or existing columns never halt downstream migrations.
- **1-Command Auto-Migration:** Run `npm run db:auto-migrate` to safely synchronize all 19 tables, performance indexes, and initial settings without manual SQL console access.

---

## 4. Recent Zero-Loss Additive Migrations
1. `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;` (Webhook soft-delete support)
2. `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_otp" text;`
3. `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_otp_expires_at" timestamp with time zone;`
4. `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "upi_utr" text;`
5. `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "idempotency_key" text;`
6. `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "verified_at" timestamp with time zone;`
7. `CREATE INDEX IF NOT EXISTS "idx_products_fts" ON "products" USING gin (to_tsvector('english', "title" || ' ' || coalesce("description", '')));` (Full-text search)
8. `CREATE TABLE IF NOT EXISTS "media_assets" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "store_id" uuid, "file_id" text NOT NULL, "file_name" text NOT NULL, "url" text NOT NULL, "content_type" text, "size_bytes" bigint, "created_at" timestamptz DEFAULT now() NOT NULL);`
9. `CREATE TABLE IF NOT EXISTS "pow_used" ("challenge_hash" text PRIMARY KEY, "used_at" timestamptz DEFAULT now() NOT NULL);`
10. `CREATE INDEX IF NOT EXISTS "idx_pow_used_at" ON "pow_used" ("used_at");`
11. `settings` key `home.slides`: JSON array of max 5 slides (`[{ image, title, subtitle, badge, ctaLabel, ctaHref, strategy, mirroredUrl, active, order }]`), validated via Zod `heroSlidesArraySchema`.
12. `settings` key `stats.mirroredBytes`: Cumulative mirrored storage counter (integer byte tally) for Backblaze B2 usage tracking against the 10GB free tier.
13. `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "priority" text DEFAULT 'normal' NOT NULL;`
14. `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "channel_id" text DEFAULT 'general' NOT NULL;`
15. `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "action_buttons" jsonb DEFAULT '[]'::jsonb NOT NULL;`
16. Dynamic NPCI UPI QR engine with environment parameterization (`NEXT_PUBLIC_UPI_VPA`, `NEXT_PUBLIC_UPI_PAYEE_NAME`).
17. DPDP Act 2023 compliant `CookieConsent` preferences and sandboxed `ThirdPartyEmbed` security wrapper.
18. `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "helpful_count" integer DEFAULT 0 NOT NULL;`
19. `CREATE TABLE IF NOT EXISTS "review_votes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "review_id" uuid NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE, "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE, "ip_hash" text, "created_at" timestamptz DEFAULT now() NOT NULL);`
20. `CREATE INDEX IF NOT EXISTS "idx_review_votes_review" ON "review_votes" ("review_id");`
21. `CREATE INDEX IF NOT EXISTS "idx_review_votes_user" ON "review_votes" ("user_id");`
*Note: Existing `home.banner` settings key is 100% preserved as automatic zero-cost fallback.*


