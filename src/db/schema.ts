import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/*  Aalm Vastralay – PostgreSQL schema (Neon compatible)               */
/*  UUID primary keys, TIMESTAMPTZ timestamps, per blueprint Section 3 */
/* ------------------------------------------------------------------ */

const money = (name: string) => numeric(name, { precision: 10, scale: 2, mode: "number" });

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull().unique(),
    fullName: text("full_name"),
    phone: text("phone"),
    role: text("role").notNull().default("customer"),
    avatarUrl: text("avatar_url"),
    // Local credential fallback (Clerk handles this in production).
    passwordHash: text("password_hash"),
    resetOtp: text("reset_otp"),
    resetOtpExpiresAt: timestamp("reset_otp_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [check("users_role_check", sql`${t.role} IN ('customer','seller','admin')`)],
);

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }),
  storeName: text("store_name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  gstNumber: text("gst_number"),
  isActive: boolean("is_active").default(true).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2, mode: "number" }).default(0),
  totalSales: integer("total_sales").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id),
  iconUrl: text("icon_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id").references(() => stores.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    price: money("price").notNull(),
    mrp: money("mrp"),
    discountPercent: numeric("discount_percent", { precision: 5, scale: 2, mode: "number" }).generatedAlwaysAs(
      sql`CASE WHEN mrp > price THEN ((mrp - price) / mrp * 100) ELSE 0 END`,
    ),
    stock: integer("stock").default(0).notNull(),
    shippingWeightGrams: integer("shipping_weight_grams").default(0).notNull(),
    sku: text("sku").unique(),
    images: jsonb("images").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    videoUrl: text("video_url"),
    tags: text("tags").array(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    rating: numeric("rating", { precision: 3, scale: 2, mode: "number" }).default(0),
    totalReviews: integer("total_reviews").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_products_store").on(t.storeId),
    index("idx_products_category").on(t.categoryId),
    index("idx_products_active").on(t.isActive).where(sql`is_active = true`),
    index("idx_products_category_active").on(t.categoryId, t.isActive),
    index("idx_products_fts").using(
      "gin",
      sql`to_tsvector('english', ${t.title} || ' ' || COALESCE(${t.description}, ''))`,
    ),
  ],
);

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  size: text("size"),
  color: text("color"),
  priceAdjustment: money("price_adjustment").default(0).notNull(),
  stock: integer("stock").default(0).notNull(),
  sku: text("sku").unique(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    customerId: uuid("customer_id").references(() => users.id),
    storeId: uuid("store_id").references(() => stores.id),
    status: text("status").notNull().default("pending"),
    paymentMethod: text("payment_method"),
    paymentStatus: text("payment_status").default("pending").notNull(),
    subtotal: money("subtotal").notNull(),
    shippingFee: money("shipping_fee").default(0).notNull(),
    total: money("total").notNull(),
    shippingAddress: jsonb("shipping_address").$type<ShippingAddress>().notNull(),
    trackingNumber: text("tracking_number"),
    courier: text("courier"),
    notes: text("notes"),
    upiUtr: text("upi_utr"),
    /** Idempotency key to prevent double-submit / double-restock. Added safely, nullable for old rows. */
    idempotencyKey: text("idempotency_key").unique(),
    /** Timestamp when admin verifies UPI payment. Null until verified. */
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check(
      "orders_status_check",
      sql`${t.status} IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')`,
    ),
    check("orders_payment_method_check", sql`${t.paymentMethod} IN ('cod','online','upi')`),
    index("idx_orders_customer").on(t.customerId),
    index("idx_orders_store").on(t.storeId),
    index("idx_orders_status").on(t.status),
    index("idx_orders_created").on(t.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),
    quantity: integer("quantity").notNull(),
    price: money("price").notNull(),
    total: money("total").notNull(),
  },
  (t) => [index("idx_order_items_order").on(t.orderId)],
);

export const cart = pgTable(
  "cart",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("cart_user_product_variant_unique").on(t.userId, t.productId, t.variantId), index("idx_cart_user").on(t.userId)],
);

export const wishlist = pgTable(
  "wishlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("wishlist_user_product_unique").on(t.userId, t.productId)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id),
    orderId: uuid("order_id").references(() => orders.id),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body"),
    images: jsonb("images").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check("reviews_rating_check", sql`${t.rating} BETWEEN 1 AND 5`),
    index("idx_reviews_product").on(t.productId),
    index("idx_reviews_product_verified").on(t.productId, t.isVerified),
  ],
);

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    discountType: text("discount_type").notNull(),
    discountValue: money("discount_value").notNull(),
    minOrderValue: money("min_order_value").default(0).notNull(),
    maxDiscount: money("max_discount"),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").default(0).notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (t) => [check("coupons_discount_type_check", sql`${t.discountType} IN ('percentage','fixed')`)],
);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  data: jsonb("data").$type<Record<string, unknown>>(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Home"),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    addressLine: text("address_line").notNull(),
    landmark: text("landmark"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    pincode: text("pincode").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_addresses_user").on(t.userId),
    index("idx_addresses_user_default").on(t.userId, t.isDefault),
  ],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  group: text("group").default("general").notNull(),
  label: text("label"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    target: text("target"),
    detail: text("detail"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_audit_created").on(t.createdAt), index("idx_audit_actor").on(t.actorId)],
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    ip: text("ip"),
    success: boolean("success").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_login_attempt_identifier").on(t.identifier, t.createdAt)],
);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").default(0).notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).defaultNow().notNull(),
});

/* ---------------------------- relations ---------------------------- */

export const usersRelations = relations(users, ({ many }) => ({
  stores: many(stores),
  orders: many(orders),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "parent" }),
  children: many(categories, { relationName: "parent" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, { fields: [orders.customerId], references: [users.id] }),
  store: one(stores, { fields: [orders.storeId], references: [stores.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

/* ------------------------------ types ------------------------------ */

export type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
};

export type User = typeof users.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
