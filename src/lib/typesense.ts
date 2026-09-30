/**
 * 👑 AALM VASTRALAY — TYPESENSE FEDERATED INSTANT SEARCH ADAPTER
 * Location: src/lib/typesense.ts
 *
 * Conforms to docs/RULES.md Section 4.3:
 *  - Microsecond-latency typo-tolerant search across ethnic product catalogs.
 *  - Dual Engine Fail-Soft Architecture:
 *      * Mode A (Typesense Cloud / Cluster): When TYPESENSE_HOST & TYPESENSE_API_KEY exist.
 *      * Mode B (Neon Postgres FTS Fallback): Graceful zero-downtime degradation when unconfigured.
 *  - Supports ethnic facet filters: price range, tags, categories, availability.
 */

import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { and, eq, ilike, or, gte, lte, desc } from "drizzle-orm";

export interface SearchFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  tags?: string[];
  limit?: number;
  page?: number;
}

export interface SearchProductResult {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  mrp?: number | null;
  discountPercent?: number | null;
  images: string[];
  rating?: number | null;
  totalReviews?: number;
  isFeatured?: boolean;
  stock?: number;
  storeName?: string | null;
  storeSlug?: string | null;
}

export interface SearchResponse {
  source: "typesense" | "postgres_fallback";
  query: string;
  total: number;
  products: SearchProductResult[];
  latencyMs: number;
}

/**
 * Checks if Typesense cluster configuration is present in environment variables.
 */
export function isTypesenseConfigured(): boolean {
  return Boolean(
    process.env.TYPESENSE_HOST &&
    process.env.TYPESENSE_API_KEY
  );
}

/**
 * Converts high-level search filters into Typesense-compatible filter_by strings.
 */
export function buildTypesenseFilterString(filters?: SearchFilters): string {
  const conditions: string[] = ["is_active:=true"];

  if (!filters) {
    return conditions.join(" && ");
  }

  if (filters.inStockOnly) {
    conditions.push("stock:>0");
  }

  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    conditions.push(`price:[${filters.minPrice}..${filters.maxPrice}]`);
  } else if (filters.minPrice !== undefined) {
    conditions.push(`price:>=${filters.minPrice}`);
  } else if (filters.maxPrice !== undefined) {
    conditions.push(`price:<=${filters.maxPrice}`);
  }

  if (filters.tags && filters.tags.length > 0) {
    conditions.push(`tags:=[${filters.tags.join(",")}]`);
  }

  return conditions.join(" && ");
}

/**
 * Executes fallback Postgres FTS / ILIKE query across products.
 */
export async function searchPostgresFallback(
  query: string,
  filters?: SearchFilters
): Promise<SearchProductResult[]> {
  try {
    const cleanQuery = query.trim();
    const limit = Math.min(filters?.limit || 24, 100);
    const whereConditions = [eq(products.isActive, true)];

    if (cleanQuery) {
      whereConditions.push(
        or(
          ilike(products.title, `%${cleanQuery}%`),
          ilike(products.description, `%${cleanQuery}%`),
          ilike(products.slug, `%${cleanQuery}%`)
        )!
      );
    }

    if (filters?.minPrice !== undefined) {
      whereConditions.push(gte(products.price, filters.minPrice));
    }

    if (filters?.maxPrice !== undefined) {
      whereConditions.push(lte(products.price, filters.maxPrice));
    }

    if (filters?.inStockOnly) {
      whereConditions.push(gte(products.stock, 1));
    }

    const rows = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        description: products.description,
        price: products.price,
        mrp: products.mrp,
        discountPercent: products.discountPercent,
        images: products.images,
        rating: products.rating,
        totalReviews: products.totalReviews,
        isFeatured: products.isFeatured,
        stock: products.stock,
        storeName: stores.storeName,
        storeSlug: stores.slug,
      })
      .from(products)
      .leftJoin(stores, eq(products.storeId, stores.id))
      .where(and(...whereConditions))
      .orderBy(desc(products.isFeatured), desc(products.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      ...r,
      images: Array.isArray(r.images) ? r.images : [],
    }));
  } catch (err) {
    console.error("[Typesense Fallback] Postgres query failed:", err);
    return [];
  }
}

/**
 * Primary entry point for ethnic catalog search.
 * Tries Typesense cluster with a tight 1500ms timeout; falls back to Postgres on timeout or error.
 */
export async function searchEthnicCatalog(
  query: string,
  filters?: SearchFilters
): Promise<SearchResponse> {
  const startTime = Date.now();
  const cleanQuery = query.trim();

  // If Typesense is not configured, directly execute fast Postgres query
  if (!isTypesenseConfigured()) {
    const fallbackResults = await searchPostgresFallback(cleanQuery, filters);
    return {
      source: "postgres_fallback",
      query: cleanQuery,
      total: fallbackResults.length,
      products: fallbackResults,
      latencyMs: Date.now() - startTime,
    };
  }

  // Attempt Typesense search with 1500ms abort controller timeout
  try {
    const host = process.env.TYPESENSE_HOST!;
    const port = process.env.TYPESENSE_PORT || "443";
    const protocol = process.env.TYPESENSE_PROTOCOL || "https";
    const apiKey = process.env.TYPESENSE_API_KEY!;
    const collection = process.env.TYPESENSE_COLLECTION || "products";

    const filterBy = buildTypesenseFilterString(filters);
    const limit = Math.min(filters?.limit || 24, 100);

    const searchUrl = new URL(
      `${protocol}://${host}:${port}/collections/${collection}/documents/search`
    );
    searchUrl.searchParams.set("q", cleanQuery || "*");
    searchUrl.searchParams.set("query_by", "title,description,tags,slug");
    searchUrl.searchParams.set("filter_by", filterBy);
    searchUrl.searchParams.set("per_page", String(limit));
    searchUrl.searchParams.set("num_typos", "2");
    searchUrl.searchParams.set("typo_tokens_threshold", "1");
    searchUrl.searchParams.set("prefix", "true");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        "X-TYPESENSE-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Typesense responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    interface TypesenseHit {
      document: SearchProductResult;
    }
    const hits: SearchProductResult[] = (data.hits || []).map((hit: TypesenseHit) => hit.document);

    return {
      source: "typesense",
      query: cleanQuery,
      total: data.found ?? hits.length,
      products: hits,
      latencyMs: Date.now() - startTime,
    };
  } catch (err) {
    console.warn("[Typesense Warning] External search unavailable, falling back to PostgreSQL:", err);
    const fallbackResults = await searchPostgresFallback(cleanQuery, filters);
    return {
      source: "postgres_fallback",
      query: cleanQuery,
      total: fallbackResults.length,
      products: fallbackResults,
      latencyMs: Date.now() - startTime,
    };
  }
}
