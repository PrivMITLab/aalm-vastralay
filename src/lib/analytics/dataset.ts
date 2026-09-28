import { db } from "@/db";
import { orders, orderItems, products, categories, stores } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export interface AnalyticsOrderRow {
  id: string;
  orderNumber: string;
  storeId: string | null;
  storeName: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  state: string;
  pincode: string;
  createdAt: string;
}

export interface AnalyticsItemRow {
  orderId: string;
  productId: string;
  productTitle: string;
  categoryName: string;
  fabric: string;
  occasion: string;
  price: number;
  quantity: number;
  totalPrice: number;
  gstSlab: number; // 5 or 12 percent
  estimatedTax: number;
}

export interface AnalyticsDataset {
  generatedAt: string;
  storeId: string | null;
  orders: AnalyticsOrderRow[];
  items: AnalyticsItemRow[];
  summary: {
    totalOrders: number;
    totalGmv: number;
    totalItemsSold: number;
  };
}

// In-memory cache to prevent repeated queries to Neon PostgreSQL OLTP
const datasetCache = new Map<string, { data: AnalyticsDataset; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Builds a sanitized, non-PII analytical dataset from Neon PostgreSQL.
 * If storeId is provided, filters strictly for multi-vendor isolation.
 */
export async function getAnalyticsDataset(storeId?: string | null): Promise<AnalyticsDataset> {
  const cacheKey = storeId || "__GLOBAL__";
  const cached = datasetCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // 1. Fetch Orders (limited to recent 2,000 for serverless safety)
  const orderQuery = db
    .select({
      order: orders,
      storeName: stores.storeName,
    })
    .from(orders)
    .leftJoin(stores, eq(orders.storeId, stores.id))
    .orderBy(desc(orders.createdAt))
    .limit(2000);

  const rawOrders = storeId
    ? await orderQuery.where(eq(orders.storeId, storeId))
    : await orderQuery;

  const orderRows: AnalyticsOrderRow[] = rawOrders.map(({ order: o, storeName }) => {
    const address = o.shippingAddress as Record<string, unknown> | null;
    const state = typeof address?.state === "string" ? address.state : "Other";
    const pincode = typeof address?.pincode === "string" ? address.pincode : "000000";

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      storeId: o.storeId,
      storeName: storeName || "Aalm Direct",
      status: o.status,
      paymentMethod: o.paymentMethod || "upi",
      paymentStatus: o.paymentStatus,
      subtotal: Number(o.subtotal) || 0,
      shippingFee: Number(o.shippingFee) || 0,
      total: Number(o.total) || 0,
      state,
      pincode,
      createdAt: o.createdAt.toISOString(),
    };
  });

  const orderIds = orderRows.map((o) => o.id);
  const itemRows: AnalyticsItemRow[] = [];

  if (orderIds.length > 0) {
    // 2. Fetch Order Items in chunks of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < orderIds.length; i += CHUNK_SIZE) {
      const chunk = orderIds.slice(i, i + CHUNK_SIZE);
      const rawItems = await db
        .select({
          item: orderItems,
          productTitle: products.title,
          categoryName: categories.name,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(inArray(orderItems.orderId, chunk));

      for (const { item, productTitle, categoryName } of rawItems) {
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        const totalPrice = price * qty;
        
        // Statutory Indian Apparel GST: 5% for items <= Rs 1000, 12% for items > Rs 1000
        const gstSlab = price <= 1000 ? 5 : 12;
        const estimatedTax = Number(((totalPrice * gstSlab) / (100 + gstSlab)).toFixed(2));

        // Derive fabric & occasion from title if not explicitly set
        const titleLower = (productTitle || "").toLowerCase();
        let fabric = "Silk";
        if (titleLower.includes("cotton")) fabric = "Cotton";
        else if (titleLower.includes("georgette")) fabric = "Georgette";
        else if (titleLower.includes("organza")) fabric = "Organza";
        else if (titleLower.includes("velvet")) fabric = "Velvet";
        else if (titleLower.includes("chiffon")) fabric = "Chiffon";
        else if (titleLower.includes("katan") || titleLower.includes("banarasi")) fabric = "Banarasi Katan Silk";

        let occasion = "Wedding";
        if (titleLower.includes("festive") || titleLower.includes("diwali") || titleLower.includes("puja")) occasion = "Festive";
        else if (titleLower.includes("party") || titleLower.includes("sangeet") || titleLower.includes("mehendi")) occasion = "Sangeet / Party";
        else if (titleLower.includes("casual") || titleLower.includes("daily")) occasion = "Daily Ethnic";

        itemRows.push({
          orderId: item.orderId || "",
          productId: item.productId || "",
          productTitle: productTitle || "Ethnic Product",
          categoryName: categoryName || "Ethnic Wear",
          fabric,
          occasion,
          price,
          quantity: qty,
          totalPrice,
          gstSlab,
          estimatedTax,
        });
      }
    }
  }

  const validGmvOrders = orderRows.filter((o) => o.status !== "cancelled" && o.status !== "returned");
  const totalGmv = validGmvOrders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsSold = itemRows.reduce((sum, item) => sum + item.quantity, 0);

  const dataset: AnalyticsDataset = {
    generatedAt: new Date().toISOString(),
    storeId: storeId || null,
    orders: orderRows,
    items: itemRows,
    summary: {
      totalOrders: orderRows.length,
      totalGmv,
      totalItemsSold,
    },
  };

  datasetCache.set(cacheKey, {
    data: dataset,
    expiresAt: now + CACHE_TTL_MS,
  });

  return dataset;
}

/** Clear cache for fresh dataset recalculation */
export function invalidateAnalyticsCache(storeId?: string) {
  if (storeId) {
    datasetCache.delete(storeId);
  } else {
    datasetCache.clear();
  }
}
