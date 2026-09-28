import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, stores } from "@/db/schema";
import { checkAiRateLimit, executeAiCompletion, computeAiCacheKey, getCachedAiResponse, setCachedAiResponse } from "@/lib/ai/client";
import { parseEthnicQueryDeterministic, type ParsedSearchIntent } from "@/lib/ai/search-parser";
import type { ProductCardData } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { query?: string };
    const rawQuery = (body.query ?? "").trim().slice(0, 150);

    if (rawQuery.length < 2) {
      return NextResponse.json({ ok: true, intent: null, products: [] });
    }

    const rateLimit = checkAiRateLimit(`search:${rawQuery.slice(0, 20)}`);
    const cacheKey = computeAiCacheKey("search", rawQuery);
    const cached = await getCachedAiResponse<ParsedSearchIntent>(cacheKey);

    let intent: ParsedSearchIntent = cached ?? parseEthnicQueryDeterministic(rawQuery);

    // If not cached, attempt AI parsing with Gemini 2.5 Flash
    if (!cached && rateLimit.ok) {
      try {
        const systemPrompt =
          `You are an AI Natural Language Search Parser for 'Aalm Vastralay' Indian Ethnic Wear.\n` +
          `Given a conversational search query in Hinglish or English, extract the shopping intent.\n` +
          `Return ONLY a raw JSON object with the following schema (no markdown fences, no explanation):\n` +
          `{\n` +
          `  "categorySlug": "sarees" | "lehengas" | "sherwanis" | "anarkali-suits" | "kurtas" | "dupattas" | null,\n` +
          `  "categoryName": "string or null",\n` +
          `  "color": "Standard English color name (e.g. Red, Yellow, Royal Blue, Maroon) or null",\n` +
          `  "fabric": "Silk, Banarasi, Georgette, Velvet, Organza, or null",\n` +
          `  "occasion": "Wedding, Haldi, Sangeet, Mehendi, Festive, or null",\n` +
          `  "minPrice": number or null,\n` +
          `  "maxPrice": number or null,\n` +
          `  "keywords": ["search", "keywords"],\n` +
          `  "explanation": "Brief human readable summary (e.g., 'Wedding Red Silk Sarees under ₹5,000')"\n` +
          `}`;

        const aiRes = await executeAiCompletion({
          systemPrompt,
          userPrompt: `Customer Query: "${rawQuery}"\nExtract the JSON intent.`,
          feature: "search",
          jsonMode: true,
          temperature: 0.1,
          maxTokens: 300,
        });

        const cleanJson = aiRes.text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const parsed = JSON.parse(cleanJson) as Partial<ParsedSearchIntent>;
        if (parsed.keywords && Array.isArray(parsed.keywords)) {
          intent = {
            categorySlug: parsed.categorySlug ?? intent.categorySlug,
            categoryName: parsed.categoryName ?? intent.categoryName,
            color: parsed.color ?? intent.color,
            fabric: parsed.fabric ?? intent.fabric,
            occasion: parsed.occasion ?? intent.occasion,
            minPrice: typeof parsed.minPrice === "number" ? parsed.minPrice : intent.minPrice,
            maxPrice: typeof parsed.maxPrice === "number" ? parsed.maxPrice : intent.maxPrice,
            keywords: parsed.keywords.length > 0 ? parsed.keywords : intent.keywords,
            explanation: parsed.explanation || intent.explanation,
          };
          await setCachedAiResponse(cacheKey, "search", intent);
        }
      } catch {
        // AI failed, keep deterministic intent
      }
    }

    // Now execute targeted database query using extracted intent
    const conditions: SQL[] = [eq(products.isActive, true), eq(stores.isActive, true)];

    if (typeof intent.maxPrice === "number" && intent.maxPrice > 0) {
      conditions.push(lte(products.price, intent.maxPrice));
    }
    if (typeof intent.minPrice === "number" && intent.minPrice > 0) {
      conditions.push(gte(products.price, intent.minPrice));
    }

    // Keyword & attribute matching
    const searchTerms = [
      ...(intent.color ? [intent.color.toLowerCase()] : []),
      ...(intent.fabric ? [intent.fabric.toLowerCase()] : []),
      ...(intent.occasion ? [intent.occasion.toLowerCase()] : []),
      ...intent.keywords.map((k) => k.toLowerCase()),
    ].slice(0, 6);

    const termConditions: SQL[] = [];
    for (const term of searchTerms) {
      termConditions.push(
        or(
          ilike(products.title, `%${term}%`),
          ilike(products.description, `%${term}%`),
          sql`${term} = ANY(${products.tags})`
        )!
      );
    }

    if (termConditions.length > 0) {
      conditions.push(or(...termConditions)!);
    }

    const rows = await db
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
        storeName: stores.storeName,
        storeSlug: stores.slug,
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .where(and(...conditions))
      .orderBy(desc(products.isFeatured), desc(products.rating), desc(products.createdAt))
      .limit(20);

    const matchedProducts: ProductCardData[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      price: Number(r.price),
      mrp: r.mrp ? Number(r.mrp) : null,
      discountPercent: r.discountPercent ? Number(r.discountPercent) : null,
      images: r.images,
      rating: r.rating ? Number(r.rating) : null,
      totalReviews: r.totalReviews,
      stock: r.stock,
      storeName: r.storeName,
      storeSlug: r.storeSlug,
    }));

    return NextResponse.json({
      ok: true,
      query: rawQuery,
      intent,
      products: matchedProducts,
    });
  } catch (err) {
    console.error("[ai-search route error]:", err);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
