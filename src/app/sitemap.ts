import type { MetadataRoute } from "next";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aalm-vastralay.pages.dev";
  const now = new Date();
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/stores`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/sign-in`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/sign-up`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    const [catRows, prodRows, storeRows] = await Promise.all([
      db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true)),
      db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products),
      db.select({ slug: stores.slug }).from(stores),
    ]);
    staticUrls.push(
      ...catRows.map((c) => ({ url: `${base}/products?category=${c.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
      ...prodRows.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...storeRows.map((s) => ({ url: `${base}/stores/${s.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    );
  } catch (e) {
    console.warn("[sitemap] partial failure", e);
  }
  return staticUrls;
}


