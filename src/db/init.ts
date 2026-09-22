import { sql } from "drizzle-orm";
import { db } from "./index";
import { categories, coupons, users } from "./schema";
import { hashPassword } from "../lib/password";
import { ensureSettingsRows } from "../lib/settings";

/**
 * Initializes clean, production-ready base data:
 * - Real Categories (Women, Men, Kids, Accessories)
 * - Official Admin account (admin@aalmvastralay.com)
 * - Real Default Coupons (WELCOME10)
 * - All Default Settings
 * 
 * Does NOT create any fake products, fake reviews, fake orders, or fake stores.
 */
export async function initCleanBaseData() {
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

  // 3. Admin Account
  const [existingAdmin] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`role = 'admin'`)
    .limit(1);

  let adminCreated = false;
  if (!existingAdmin) {
    await db.insert(users).values({
      email: "admin@aalmvastralay.com",
      fullName: "Aalm Vastralay Administrator",
      role: "admin",
      passwordHash: hashPassword("Admin@123"),
      phone: "9999999999",
      clerkId: "admin_initial",
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

  return { settingsCount, categoriesCount, adminCreated };
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
    DELETE FROM reviews;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM cart;
    DELETE FROM wishlist;
    DELETE FROM product_variants;
    DELETE FROM products;
    DELETE FROM notifications;
    DELETE FROM stores;
    DELETE FROM users WHERE role != 'admin';
  `);
  return { ok: true, message: "All demo products, orders, reviews, stores, and test users have been wiped clean." };
}
