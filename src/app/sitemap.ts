import type { MetadataRoute } from "next";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { getAllPosts } from "@/lib/blog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aalm-vastralay.pages.dev";
  const now = new Date();
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/stores`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/handbook`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/track-order`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/help`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/shipping`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/size-guide`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/sign-in`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/sign-up`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/shipping-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Add blog posts
  const blogPosts = getAllPosts();
  for (const post of blogPosts) {
    staticUrls.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  try {
    const [catRows, prodRows, storeRows] = await Promise.all([
      db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true)),
      db
        .select({ slug: products.slug, updatedAt: products.updatedAt })
        .from(products)
        .where(and(eq(products.isActive, true), gt(products.stock, 0)))
        .limit(500),
      db.select({ slug: stores.slug }).from(stores).where(eq(stores.isActive, true)),
    ]);
    staticUrls.push(
      ...catRows.map((c) => ({
        url: `${base}/categories/${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
      ...prodRows.map((p) => ({
        url: `${base}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...storeRows.map((s) => ({
        url: `${base}/stores/${s.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    );
  } catch (e) {
    console.warn("[sitemap] partial failure", e);
  }
  return staticUrls;
}
