import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, stores, userActivity } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { executeAiCompletion, computeAiCacheKey, getCachedAiResponse, setCachedAiResponse } from "@/lib/ai/client";
import type { ProductCardData } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get("guestId");
    const currentProductId = searchParams.get("productId");
    const viewedIdsParam = searchParams.get("viewedIds") ?? "";

    // Collect viewed product IDs from client param
    const clientViewedIds = viewedIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 10);

    // Query recent views from database
    const dbConditions = [];
    if (user) {
      dbConditions.push(eq(userActivity.userId, user.id));
    } else if (guestId) {
      dbConditions.push(eq(userActivity.guestId, guestId));
    }

    let dbViewedProductIds: string[] = [];
    if (dbConditions.length > 0) {
      const recentActivity = await db
        .select({ productId: userActivity.productId })
        .from(userActivity)
        .where(and(eq(userActivity.activityType, "view"), ...dbConditions))
        .orderBy(desc(userActivity.createdAt))
        .limit(10);

      dbViewedProductIds = recentActivity.map((r) => r.productId).filter((id): id is string => Boolean(id));
    }

    // Merge viewed product IDs
    const allViewedIds = Array.from(new Set([...clientViewedIds, ...dbViewedProductIds]));

    // Fetch details of recently viewed products to understand user's preferences
    let viewedProducts: { title: string; tags: string[] | null; categoryId: string | null }[] = [];
    if (allViewedIds.length > 0) {
      viewedProducts = await db
        .select({
          title: products.title,
          tags: products.tags,
          categoryId: products.categoryId,
        })
        .from(products)
        .where(inArray(products.id, allViewedIds.slice(0, 8)));
    }

    // Candidate products to recommend from
    const candidateQueryConditions = [
      eq(products.isActive, true),
      eq(stores.isActive, true),
    ];
    if (currentProductId) {
      candidateQueryConditions.push(ne(products.id, currentProductId));
    }

    const candidateRows = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        price: products.price,
        mrp: products.mrp,
        discountPercent: products.discountPercent,
        images: products.images,
        rating: products.rating,
        totalReviews: products.totalReviews,
        stock: products.stock,
        tags: products.tags,
        categoryId: products.categoryId,
        categoryName: categories.name,
        storeName: stores.storeName,
        storeSlug: stores.slug,
        isFeatured: products.isFeatured,
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...candidateQueryConditions))
      .orderBy(desc(products.isFeatured), desc(products.rating), desc(products.totalReviews))
      .limit(24);

    if (candidateRows.length === 0) {
      return NextResponse.json({ ok: true, products: [] });
    }

    // If no browsing history, return top featured & rated catalog products directly
    if (viewedProducts.length === 0) {
      const topPicks: ProductCardData[] = candidateRows.slice(0, 8).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: Number(p.price),
        mrp: p.mrp ? Number(p.mrp) : null,
        discountPercent: p.discountPercent ? Number(p.discountPercent) : null,
        images: p.images,
        rating: p.rating ? Number(p.rating) : null,
        totalReviews: p.totalReviews,
        stock: p.stock,
        storeName: p.storeName,
        storeSlug: p.storeSlug,
      }));
      return NextResponse.json({ ok: true, products: topPicks, reason: "trending" });
    }

    // Fast AI Inference via Groq Llama-3.3-70B (sub-350ms) to rank best matching candidates
    const historySummary = viewedProducts
      .map((p) => `- ${p.title} (Tags: ${(p.tags ?? []).join(", ")})`)
      .join("\n");

    const candidateList = candidateRows.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.categoryName,
      tags: c.tags,
      price: c.price,
    }));

    const cacheKey = computeAiCacheKey(
      "recommendation",
      `${allViewedIds.sort().join(",")}:${candidateRows.map((c) => c.id).slice(0, 10).join(",")}`
    );

    const cachedIds = await getCachedAiResponse<string[]>(cacheKey);
    let selectedIds: string[] = cachedIds ?? [];

    if (!cachedIds || cachedIds.length === 0) {
      try {
        const systemPrompt =
          `You are an AI Recommendation Engine for Aalm Vastralay Indian Ethnic Wear.\n` +
          `Given a customer's recent browsing history and available products, select the 4 to 8 MOST complementary and relevant product IDs.\n` +
          `Return ONLY a raw JSON array of strings containing the selected product IDs in ranked order, like: ["id1", "id2", "id3"]. No markdown, no explanations.`;

        const userPrompt =
          `Customer Browsing History:\n${historySummary}\n\n` +
          `Available Products:\n${JSON.stringify(candidateList, null, 2)}\n\n` +
          `Select the top 4-8 best matching product IDs as a JSON array.`;

        const aiRes = await executeAiCompletion({
          systemPrompt,
          userPrompt,
          feature: "recommendation",
          jsonMode: true,
          temperature: 0.2,
          maxTokens: 300,
        });

        const cleanJson = aiRes.text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          selectedIds = parsed.filter((id): id is string => typeof id === "string");
          await setCachedAiResponse(cacheKey, "recommendation", selectedIds);
        }
      } catch {
        // Fallback: heuristic scoring by category and shared tags
        const preferredCatIds = new Set(viewedProducts.map((p) => p.categoryId).filter(Boolean));
        const preferredTags = new Set(
          viewedProducts.flatMap((p) => (p.tags ?? []).map((t) => t.toLowerCase()))
        );

        selectedIds = candidateRows
          .map((c) => {
            let score = 0;
            if (c.categoryId && preferredCatIds.has(c.categoryId)) score += 5;
            if (c.tags) {
              for (const t of c.tags) {
                if (preferredTags.has(t.toLowerCase())) score += 2;
              }
            }
            if (c.isFeatured) score += 1;
            return { id: c.id, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
          .map((item) => item.id);
      }
    }

    // Map ordered IDs back to full product records
    const productMap = new Map(candidateRows.map((c) => [c.id, c]));
    const matchedProducts: ProductCardData[] = [];

    for (const id of selectedIds) {
      const p = productMap.get(id);
      if (p) {
        matchedProducts.push({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: Number(p.price),
          mrp: p.mrp ? Number(p.mrp) : null,
          discountPercent: p.discountPercent ? Number(p.discountPercent) : null,
          images: p.images,
          rating: p.rating ? Number(p.rating) : null,
          totalReviews: p.totalReviews,
          stock: p.stock,
          storeName: p.storeName,
          storeSlug: p.storeSlug,
        });
      }
    }

    // If fewer than 4 matched, pad with candidate products
    if (matchedProducts.length < 4) {
      for (const p of candidateRows) {
        if (!matchedProducts.some((m) => m.id === p.id)) {
          matchedProducts.push({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: Number(p.price),
            mrp: p.mrp ? Number(p.mrp) : null,
            discountPercent: p.discountPercent ? Number(p.discountPercent) : null,
            images: p.images,
            rating: p.rating ? Number(p.rating) : null,
            totalReviews: p.totalReviews,
            stock: p.stock,
            storeName: p.storeName,
            storeSlug: p.storeSlug,
          });
          if (matchedProducts.length >= 8) break;
        }
      }
    }

    return NextResponse.json({ ok: true, products: matchedProducts, reason: "personalized" });
  } catch (err) {
    console.error("[recommendations route error]:", err);
    return NextResponse.json({ error: "Failed to generate recommendations." }, { status: 500 });
  }
}
