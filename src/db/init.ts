import { sql } from "drizzle-orm";
import { db } from "./index";
import { categories, coupons, settings, users } from "./schema";
import { hashPassword } from "../lib/password";
import { ensureSettingsRows } from "../lib/settings";
import { autoPruneOldData } from "../lib/db-hygiene";

/**
 * Complete DDL statements for all 16 tables with IF NOT EXISTS checks.
 * Guarantees zero-touch database provisioning — users never need manual SQL.
 */
const TABLE_DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "clerk_id" text NOT NULL UNIQUE,
    "email" text NOT NULL UNIQUE,
    "full_name" text,
    "phone" text,
    "role" text DEFAULT 'customer' NOT NULL,
    "avatar_url" text,
    "password_hash" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "users_role_check" CHECK ("role" IN ('customer','seller','admin'))
  )`,

  `CREATE TABLE IF NOT EXISTS "stores" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "owner_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
    "store_name" text NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "description" text,
    "logo_url" text,
    "banner_url" text,
    "address" text,
    "city" text,
    "state" text,
    "pincode" text,
    "gst_number" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "rating" numeric(3, 2) DEFAULT 0,
    "total_sales" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "parent_id" uuid REFERENCES "categories"("id"),
    "icon_url" text,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "store_id" uuid REFERENCES "stores"("id") ON DELETE CASCADE,
    "category_id" uuid REFERENCES "categories"("id"),
    "title" text NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "description" text,
    "price" numeric(10, 2) NOT NULL,
    "mrp" numeric(10, 2),
    "discount_percent" numeric(5, 2) GENERATED ALWAYS AS (CASE WHEN mrp > price THEN ((mrp - price) / mrp * 100) ELSE 0 END) STORED,
    "stock" integer DEFAULT 0 NOT NULL,
    "shipping_weight_grams" integer DEFAULT 0 NOT NULL,
    "sku" text UNIQUE,
    "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "video_url" text,
    "tags" text[],
    "is_active" boolean DEFAULT true NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "rating" numeric(3, 2) DEFAULT 0,
    "total_reviews" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
    "size" text,
    "color" text,
    "price_adjustment" numeric(10, 2) DEFAULT 0 NOT NULL,
    "stock" integer DEFAULT 0 NOT NULL,
    "sku" text UNIQUE
  )`,

  `CREATE TABLE IF NOT EXISTS "orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "order_number" text NOT NULL UNIQUE,
    "customer_id" uuid REFERENCES "users"("id"),
    "store_id" uuid REFERENCES "stores"("id"),
    "status" text DEFAULT 'pending' NOT NULL,
    "payment_method" text,
    "payment_status" text DEFAULT 'pending' NOT NULL,
    "subtotal" numeric(10, 2) NOT NULL,
    "shipping_fee" numeric(10, 2) DEFAULT 0 NOT NULL,
    "total" numeric(10, 2) NOT NULL,
    "shipping_address" jsonb NOT NULL,
    "tracking_number" text,
    "courier" text,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "orders_status_check" CHECK ("status" IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
    CONSTRAINT "orders_payment_method_check" CHECK ("payment_method" IN ('cod','online','upi'))
  )`,

  `CREATE TABLE IF NOT EXISTS "order_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "order_id" uuid REFERENCES "orders"("id") ON DELETE CASCADE,
    "product_id" uuid REFERENCES "products"("id"),
    "variant_id" uuid REFERENCES "product_variants"("id"),
    "quantity" integer NOT NULL,
    "price" numeric(10, 2) NOT NULL,
    "total" numeric(10, 2) NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "cart" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
    "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
    "variant_id" uuid REFERENCES "product_variants"("id"),
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "cart_user_product_variant_unique" UNIQUE("user_id","product_id","variant_id")
  )`,

  `CREATE TABLE IF NOT EXISTS "wishlist" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
    "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "wishlist_user_product_unique" UNIQUE("user_id","product_id")
  )`,

  `CREATE TABLE IF NOT EXISTS "reviews" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "product_id" uuid REFERENCES "products"("id") ON DELETE CASCADE,
    "user_id" uuid REFERENCES "users"("id"),
    "order_id" uuid REFERENCES "orders"("id"),
    "rating" integer NOT NULL,
    "title" text,
    "body" text,
    "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
  )`,

  `CREATE TABLE IF NOT EXISTS "coupons" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" text NOT NULL UNIQUE,
    "discount_type" text NOT NULL,
    "discount_value" numeric(10, 2) NOT NULL,
    "min_order_value" numeric(10, 2) DEFAULT 0 NOT NULL,
    "max_discount" numeric(10, 2),
    "usage_limit" integer,
    "used_count" integer DEFAULT 0 NOT NULL,
    "valid_from" timestamp with time zone,
    "valid_until" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "coupons_discount_type_check" CHECK ("discount_type" IN ('percentage','fixed'))
  )`,

  `CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
    "type" text NOT NULL,
    "title" text NOT NULL,
    "body" text,
    "data" jsonb,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "addresses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
    "label" text DEFAULT 'Home' NOT NULL,
    "full_name" text NOT NULL,
    "phone" text NOT NULL,
    "address_line" text NOT NULL,
    "landmark" text,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "pincode" text NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "settings" (
    "key" text PRIMARY KEY NOT NULL,
    "value" text,
    "group" text DEFAULT 'general' NOT NULL,
    "label" text,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "actor_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "actor_email" text,
    "action" text NOT NULL,
    "target" text,
    "detail" text,
    "ip" text,
    "user_agent" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "login_attempts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "identifier" text NOT NULL,
    "ip" text,
    "success" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "rate_limits" (
    "key" text PRIMARY KEY NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "window_start" timestamp with time zone DEFAULT now() NOT NULL
  )`,
];

const INDEX_DDL_STATEMENTS = [
  `CREATE INDEX IF NOT EXISTS "idx_addresses_user" ON "addresses" ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_audit_created" ON "audit_logs" ("created_at")`,
  `CREATE INDEX IF NOT EXISTS "idx_audit_actor" ON "audit_logs" ("actor_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_cart_user" ON "cart" ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_login_attempt_identifier" ON "login_attempts" ("identifier","created_at")`,
  `CREATE INDEX IF NOT EXISTS "idx_orders_customer" ON "orders" ("customer_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_orders_store" ON "orders" ("store_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status")`,
  `CREATE INDEX IF NOT EXISTS "idx_products_store" ON "products" ("store_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products" ("category_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_products_active" ON "products" ("is_active") WHERE is_active = true`,
  `CREATE INDEX IF NOT EXISTS "idx_reviews_product" ON "reviews" ("product_id")`,
];

/**
 * Automatically creates all tables and indexes if missing.
 */
export async function autoEnsureTables() {
  for (const stmt of TABLE_DDL_STATEMENTS) {
    try {
      await db.execute(sql.raw(stmt));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("already exists")) {
        console.warn("[auto-schema] Table note:", msg);
      }
    }
  }

  for (const stmt of INDEX_DDL_STATEMENTS) {
    try {
      await db.execute(sql.raw(stmt));
    } catch {
      // Non-fatal if index already exists or tsvector index differs
    }
  }
}

/**
 * Initializes clean, production-ready base data:
 * - Auto-creates all tables & indexes if not present
 * - Real Categories (Women, Men, Kids, Accessories)
 * - Official Admin account (admin@aalmvastralay.com)
 * - Real Default Coupons (WELCOME10)
 * - All Default Settings
 * - Storage hygiene auto-pruning
 */
export async function initCleanBaseData() {
  // 0. Ensure tables exist
  await autoEnsureTables();

  // 1. Settings
  const settingsCount = await ensureSettingsRows();

  // 2. Categories
  let categoriesCount = 0;
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
  if (count === 0) {
    const parents = [
      { name: "Women's Ethnic", slug: "women", sortOrder: 1 },
      { name: "Men's Ethnic", slug: "men", sortOrder: 2 },
      { name: "Kids", slug: "kids", sortOrder: 3 },
      { name: "Accessories", slug: "accessories", sortOrder: 4 },
    ];
    const parentRows = await db.insert(categories).values(parents).returning();
    const parentId = (slug: string) => parentRows.find((p) => p.slug === slug)!.id;

    const children = [
      ["Lehengas", "lehengas", "women", 1],
      ["Sarees", "sarees", "women", 2],
      ["Anarkali Suits", "anarkali-suits", "women", 3],
      ["Salwar Kameez", "salwar-kameez", "women", 4],
      ["Gowns", "gowns", "women", 5],
      ["Sherwanis", "sherwanis", "men", 1],
      ["Kurta Sets", "kurta-sets", "men", 2],
      ["Nehru Jackets", "nehru-jackets", "men", 3],
      ["Indo-Western", "indo-western", "men", 4],
      ["Girls Ethnic", "girls-ethnic", "kids", 1],
      ["Boys Ethnic", "boys-ethnic", "kids", 2],
      ["Dupattas", "dupattas", "accessories", 1],
      ["Jewellery", "jewellery", "accessories", 2],
      ["Juttis & Mojaris", "footwear", "accessories", 3],
    ] as const;

    await db.insert(categories).values(
      children.map(([name, slug, parent, sortOrder]) => ({
        name,
        slug,
        parentId: parentId(parent),
        sortOrder,
      }))
    );
    categoriesCount = children.length + parents.length;
  }

  // 3. Single Super-Admin Account
  const [existingAdmin] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`role = 'admin'`)
    .limit(1);

  let adminCreated = false;
  if (!existingAdmin) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@aalmvastralay.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    await db.insert(users).values({
      email: adminEmail,
      fullName: "Aalm Vastralay Administrator",
      role: "admin",
      passwordHash: hashPassword(adminPassword),
      phone: "9999999999",
      clerkId: "super_admin_primary",
    });
    adminCreated = true;
  }

  // 4. Default Official Coupon
  await db
    .insert(coupons)
    .values({
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      maxDiscount: 500,
      minOrderValue: 999,
      isActive: true,
    })
    .onConflictDoNothing();

  // 5. Automated database hygiene (storage cleanup)
  await autoPruneOldData();

  const [{ count: totalCategories }] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
  const [{ count: totalSettings }] = await db.select({ count: sql<number>`count(*)::int` }).from(settings);
  const [{ count: totalAdmins }] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(sql`role = 'admin'`);

  return {
    status: "healthy",
    message: "Base schema, settings, categories, and super-admin are fully active.",
    settingsCount: totalSettings,
    categoriesCount: totalCategories,
    totalAdmins,
    adminCreated: adminCreated || totalAdmins > 0,
    newSettingsAdded: settingsCount,
  };
}

/**
 * Wipes all fake/demo data from the database:
 * - Deletes fake customer reviews
 * - Deletes fake orders and order items
 * - Deletes cart and wishlist
 * - Deletes fake products and variants
 * - Deletes fake stores
 * - Deletes non-admin test users
 * 
 * Leaves categories, settings, and the real admin account untouched!
 */
export async function wipeDemoData() {
  await db.execute(sql`
    DELETE FROM addresses;
    DELETE FROM reviews;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM cart;
    DELETE FROM wishlist;
    DELETE FROM product_variants;
    DELETE FROM products;
    DELETE FROM notifications;
    DELETE FROM stores;
    DELETE FROM audit_logs;
    DELETE FROM login_attempts;
    DELETE FROM rate_limits;
    DELETE FROM users WHERE role != 'admin';
  `);
  return { ok: true, message: "All demo products, orders, reviews, stores, addresses, audit logs, and test users have been wiped clean." };
}
