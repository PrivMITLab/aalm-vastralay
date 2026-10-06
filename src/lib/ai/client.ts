import crypto from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { aiCache } from "@/db/schema";

/**
 * 👑 AALM VASTRALAY — 100% FREE AI INFERENCE CLIENT
 *
 * Multi-Tier Free AI Orchestration:
 * - Google Gemini 2.5 Flash: Exceptional Hinglish/Indic understanding & structured JSON schemas.
 * - Groq Cloud Llama-3.3-70B: Sub-300ms ultra-low-latency real-time inference.
 * - Zero-Dependency: Uses native fetch (Cloudflare & Node.js edge compatible).
 * - Multi-Level Caching: In-memory LRU + Neon `ai_cache` table to conserve free quotas.
 * - Deterministic Fallbacks: Gracefully generates rich content even if keys are unset or quotas exhausted.
 */

export type AiProvider = "gemini" | "groq" | "mistral" | "fallback";

export type AiGenerationOptions = {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  feature: "description" | "search" | "recommendation";
  preferredProvider?: "gemini" | "groq" | "mistral" | "auto";
  model?: string;
};

// In-memory LRU cache for ultra-fast deduplication (lasts lifetime of server instance)
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>();
const MAX_MEMORY_CACHE_ITEMS = 250;
const MEMORY_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Rate limiter token bucket per client/IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Checks in-memory client rate limit to protect free tier quotas.
 */
export function checkAiRateLimit(identifier: string): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, retryAfterSec: 0 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { ok: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return { ok: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, retryAfterSec: 0 };
}

/**
 * Generate a deterministic SHA-256 hash for caching prompts and features.
 */
export function computeAiCacheKey(feature: string, prompt: string): string {
  return crypto.createHash("sha256").update(`${feature}:${prompt.trim().toLowerCase()}`).digest("hex");
}

/**
 * Retrieve cached response from memory or Neon PostgreSQL `ai_cache`.
 */
export async function getCachedAiResponse<T>(cacheKey: string): Promise<T | null> {
  const now = Date.now();
  const memHit = memoryCache.get(cacheKey);
  if (memHit && memHit.expiresAt > now) {
    return memHit.data as T;
  }

  try {
    const [row] = await db
      .select({ response: aiCache.response })
      .from(aiCache)
      .where(eq(aiCache.cacheKey, cacheKey))
      .limit(1);

    if (row && row.response) {
      // Async update hit count
      db.update(aiCache)
        .set({
          hitCount: sql`${aiCache.hitCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(aiCache.cacheKey, cacheKey))
        .catch(() => {});

      memoryCache.set(cacheKey, { data: row.response, expiresAt: now + MEMORY_CACHE_TTL_MS });
      return row.response as T;
    }
  } catch (err) {
    console.warn("[AiCache] Database lookup error (continuing without cache):", err);
  }

  return null;
}

/**
 * Save AI response to memory and Neon PostgreSQL `ai_cache`.
 */
export async function setCachedAiResponse<T>(
  cacheKey: string,
  feature: "description" | "search" | "recommendation",
  data: T
): Promise<void> {
  const now = Date.now();
  if (memoryCache.size >= MAX_MEMORY_CACHE_ITEMS) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(cacheKey, { data, expiresAt: now + MEMORY_CACHE_TTL_MS });

  try {
    await db
      .insert(aiCache)
      .values({
        cacheKey,
        feature,
        response: data as Record<string, unknown>,
        hitCount: 1,
      })
      .onConflictDoUpdate({
        target: aiCache.cacheKey,
        set: {
          response: data as Record<string, unknown>,
          hitCount: sql`${aiCache.hitCount} + 1`,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    console.warn("[AiCache] Database insert error (in-memory cached):", err);
  }
}

/**
 * Call Google Gemini 2.5 Flash with fallback to 1.5 Flash.
 */
async function callGemini(options: AiGenerationOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: Record<string, unknown> = {
        contents: [
          ...(options.systemPrompt
            ? [{ role: "user", parts: [{ text: `System Instructions: ${options.systemPrompt}` }] }, { role: "model", parts: [{ text: "Understood. I will strictly follow these instructions." }] }]
            : []),
          { role: "user", parts: [{ text: options.userPrompt }] },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          maxOutputTokens: options.maxTokens ?? 1024,
          ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini ${model} HTTP ${res.status}: ${errText}`);
      }

      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };

      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(`Empty response from Gemini ${model}`);

      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // If error is 404 (model not found), proceed to fallback model
      if (!String(err).includes("404")) {
        break; // Other error, don't waste extra calls
      }
    }
  }

  throw lastError ?? new Error("Gemini invocation failed");
}

/**
 * Call Groq Cloud Llama 3.3 70B with fallback to Llama 3.1 8B.
 */
async function callGroq(options: AiGenerationOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");

  const customModel = options.model || process.env.GROQ_MODEL;
  const models = customModel ? [customModel, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"] : ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = "https://api.groq.com/openai/v1/chat/completions";
      const messages = [
        ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
        { role: "user", content: options.userPrompt },
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9_000);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 1024,
          ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq ${model} HTTP ${res.status}: ${errText}`);
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };

      const text = json.choices?.[0]?.message?.content;
      if (!text) throw new Error(`Empty response from Groq ${model}`);

      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Groq invocation failed");
}

/**
 * Call Mistral AI with mistral-small-latest or mistral-large-latest.
 */
async function callMistral(options: AiGenerationOptions): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY is not configured.");

  const customModel = options.model || process.env.MISTRAL_MODEL;
  const models = customModel ? [customModel, "mistral-small-latest", "open-mistral-nemo"] : ["mistral-small-latest", "open-mistral-nemo", "mistral-large-latest"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = "https://api.mistral.ai/v1/chat/completions";
      const messages = [
        ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
        { role: "user", content: options.userPrompt },
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.35,
          max_tokens: options.maxTokens ?? 1024,
          ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Mistral ${model} HTTP ${res.status}: ${errText}`);
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };

      const text = json.choices?.[0]?.message?.content;
      if (!text) throw new Error(`Empty response from Mistral ${model}`);

      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Mistral invocation failed");
}

/**
 * Unified Free AI inference engine with automatic multi-tier fallback.
 * Automatically tries available keys (Gemini, Groq, Mistral) in order of preference.
 */
export async function executeAiCompletion(
  options: AiGenerationOptions
): Promise<{ text: string; provider: AiProvider; cached: boolean }> {
  const cacheKey = computeAiCacheKey(options.feature, `${options.systemPrompt ?? ""}:${options.userPrompt}`);

  // Check cache first
  const cached = await getCachedAiResponse<string>(cacheKey);
  if (cached) {
    return { text: cached, provider: "fallback", cached: true };
  }

  // Determine provider candidates based on configured API keys
  const candidates: { provider: AiProvider; fn: (opts: AiGenerationOptions) => Promise<string> }[] = [];

  const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasMistral = Boolean(process.env.MISTRAL_API_KEY);

  const preferred = options.preferredProvider || (process.env.AI_PROVIDER as "gemini" | "groq" | "mistral" | undefined) || "auto";

  if (preferred === "mistral" && hasMistral) {
    candidates.push({ provider: "mistral", fn: callMistral });
  } else if (preferred === "groq" && hasGroq) {
    candidates.push({ provider: "groq", fn: callGroq });
  } else if (preferred === "gemini" && hasGemini) {
    candidates.push({ provider: "gemini", fn: callGemini });
  }

  // Add remaining available providers as automatic fallbacks
  if (hasGemini && !candidates.some((c) => c.provider === "gemini")) {
    candidates.push({ provider: "gemini", fn: callGemini });
  }
  if (hasGroq && !candidates.some((c) => c.provider === "groq")) {
    candidates.push({ provider: "groq", fn: callGroq });
  }
  if (hasMistral && !candidates.some((c) => c.provider === "mistral")) {
    candidates.push({ provider: "mistral", fn: callMistral });
  }

  // If no API keys configured, try Gemini as default (which throws clear error to trigger deterministic fallback)
  if (candidates.length === 0) {
    candidates.push({ provider: "gemini", fn: callGemini });
  }

  for (const { provider, fn } of candidates) {
    try {
      const text = await fn(options);
      await setCachedAiResponse(cacheKey, options.feature, text);
      return { text, provider, cached: false };
    } catch (err) {
      console.warn(`[AI Engine] ${provider} failed (${err}). Trying next fallback...`);
    }
  }

  throw new Error("All configured AI providers failed.");
}

/* ============================================================================
 * 📸 MULTIMODAL VISION AI ENGINE (Gemini 2.5 Flash Vision + Universal Links)
 * ============================================================================ */

export type AiVisionAnalysisOptions = {
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  categoriesList?: { id: string; name: string; slug: string }[];
  preferredProvider?: "gemini" | "auto";
};

export type AiVisionVisualAttributes = {
  primaryColor: string;
  secondaryColor?: string;
  metallicZari?: string;
  weaveTexture: string;
  embroideryTechniques: string[];
  motifs: string[];
  borderStyle?: string;
  silhouette: string;
  setPieces?: string[];
  necklineAndSleeve?: string;
  visualClarity: "high" | "standard";
};

export type AiVisionAnalysisResult = {
  title: string;
  categorySlug: string;
  categoryName: string;
  categoryId?: string;
  fabric: string;
  color: string;
  work: string;
  craftType?: string;
  occasion: string;
  suggestedPrice: number;
  suggestedMrp: number;
  description?: string;
  shortDescription: string;
  longDescription: string;
  highlights: string[];
  tags: string[];
  stylingTips: string;
  washCare: string;
  formattedText: string;
  provider: "gemini" | "pollinations" | "fallback";
  visualAttributes?: AiVisionVisualAttributes;
};

/**
 * Resolves any image reference (B2, Drive, ImageKit, external URL, or data URL) into
 * a Base64 buffer and mimeType suitable for Gemini Multimodal Vision API.
 */
export async function prepareImageForVisionAnalysis(
  rawInput: string
): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  if (!rawInput || typeof rawInput !== "string") return null;
  const s = rawInput.trim();

  // 1. Data URL (Base64)
  const dataUrlMatch = s.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/i);
  if (dataUrlMatch) {
    return {
      inlineData: {
        mimeType: dataUrlMatch[1].toLowerCase(),
        data: dataUrlMatch[2],
      },
    };
  }

  // 2. Resolve image reference across B2, Google Drive, ImageKit, and web URLs
  let fetchUrl = s;
  if (s.startsWith("b2:")) {
    const key = s.slice(3).replace(/^\//, "");
    const b2Worker = process.env.NEXT_PUBLIC_B2_WORKER_URL || "https://marketplace.workers.dev";
    fetchUrl = `${b2Worker}/${key}`;
  } else if (s.includes("drive.google.com") || s.includes("googleusercontent.com")) {
    const gdriveMatch = s.match(/(?:id=|d\/)([a-zA-Z0-9_-]{25,})/);
    if (gdriveMatch) {
      fetchUrl = `https://lh3.googleusercontent.com/d/${gdriveMatch[1]}`;
    }
  }

  // 3. SSRF-safe remote image fetch
  try {
    const u = new URL(fetchUrl);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;

    // Block private IP/metadata targets
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "0.0.0.0" ||
      host.includes("169.254.") ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8_000);

    const res = await fetch(fetchUrl, {
      method: "GET",
      headers: { Accept: "image/*" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const contentLength = Number(res.headers.get("content-length") || "0");
    if (contentLength > 5 * 1024 * 1024) return null; // 5MB safe limit

    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength > 5 * 1024 * 1024) return null;

    const buffer = Buffer.from(arrayBuf);
    const contentType = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() || "image/jpeg";
    const mimeType = contentType.startsWith("image/") ? contentType : "image/jpeg";

    return {
      inlineData: {
        mimeType,
        data: buffer.toString("base64"),
      },
    };
  } catch (err) {
    console.warn("[VisionEngine] Image fetch failed:", err);
    return null;
  }
}

/**
 * Deterministic visual ethnic wear heuristics engine used when Gemini API key
 * is absent or quota is exhausted.
 */
export function generateDeterministicVisionFallback(
  imageRef: string,
  categoriesList?: { id: string; name: string; slug: string }[]
): AiVisionAnalysisResult {
  const q = imageRef.toLowerCase();

  let categorySlug = "lehengas";
  let categoryName = "Lehengas";

  if (q.includes("saree") || q.includes("sari") || q.includes("banarasi")) {
    categorySlug = "sarees";
    categoryName = "Sarees";
  } else if (q.includes("sherwani") || q.includes("achkan")) {
    categorySlug = "sherwanis";
    categoryName = "Sherwanis";
  } else if (q.includes("anarkali") || q.includes("suit")) {
    categorySlug = "anarkali-suits";
    categoryName = "Anarkali Suits";
  } else if (q.includes("kurta")) {
    categorySlug = "kurta-sets";
    categoryName = "Kurta Sets";
  } else if (q.includes("dupatta")) {
    categorySlug = "dupattas";
    categoryName = "Dupattas";
  }

  // Attempt to match categoryId from provided categories
  const matchedCat = categoriesList?.find(
    (c) =>
      c.slug === categorySlug ||
      c.slug.includes(categorySlug) ||
      categorySlug.includes(c.slug) ||
      c.name.toLowerCase() === categoryName.toLowerCase() ||
      c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
      categoryName.toLowerCase().includes(c.name.toLowerCase())
  );
  const categoryId = matchedCat?.id;
  if (matchedCat) {
    categorySlug = matchedCat.slug;
    categoryName = matchedCat.name;
  }

  let fabric = "Pure Katan Silk & Velvet";
  if (q.includes("velvet")) fabric = "Silk Velvet";
  else if (q.includes("georgette")) fabric = "Flowing Georgette";
  else if (q.includes("organza")) fabric = "Tissue Organza";
  else if (q.includes("chanderi")) fabric = "Handloom Chanderi";

  let color = "Crimson Red & Antique Gold";
  if (q.includes("pink") || q.includes("rani")) color = "Rani Pink & Rose Gold";
  else if (q.includes("blue")) color = "Peacock Royal Blue";
  else if (q.includes("green")) color = "Emerald Bottle Green";
  else if (q.includes("yellow") || q.includes("haldi")) color = "Mustard Haldi Yellow";
  else if (q.includes("white") || q.includes("ivory")) color = "Ivory Cream & Antique Zari";

  const work = "Handcrafted Zardozi, Sequins & Gota Patti Needlework";
  const occasion = categorySlug === "lehengas" || categorySlug === "sherwanis" ? "Bridal & Wedding Reception" : "Festive Celebrations & Wedding Soiree";

  const title = `Regal ${color.split("&")[0].trim()} ${fabric} Handcrafted ${categoryName.replace(/s$/, "")}`;
  const suggestedPrice = categorySlug === "lehengas" ? 38500 : categorySlug === "sherwanis" ? 28000 : 18500;
  const suggestedMrp = Math.round(suggestedPrice * 1.35);

  const shortDescription = `Elegantly handcrafted in luxurious ${fabric}, this exquisite ${categoryName.toLowerCase()} features timeless ${work.toLowerCase()} for memorable occasions.`;
  const longDescription =
    `Tailored with artisanal grace, this magnificent ensemble combines rich Indian heritage with effortless contemporary silhouette. The intricate embroidery catches the ambient light with subtle aristocracy, making it a treasured centerpiece of your traditional wardrobe.\n\n` +
    `Designed for supreme comfort, royal drape, and breathable wear throughout long celebratory rituals. Pair with heirloom jewellery for an unforgettable presence.`;

  const highlights = [
    `Fabric & Weave: Premium ${fabric} offering a lustrous sheen and grand silhouette`,
    `Artisan Karigari: ${work}`,
    `Occasion: Perfect for ${occasion}`,
    `Complete Set: Finished garment with artisanal border detailing`,
  ];

  const tags = [
    `${categoryName.toLowerCase()}`,
    `${fabric.toLowerCase()}`,
    `${color.split("&")[0].trim().toLowerCase()}`,
    `wedding ${categoryName.toLowerCase()}`,
    "handcrafted ethnic wear",
    "aalm vastralay",
  ];

  const stylingTips = `Style with antique gold or kundan jhumkas, a classic embellished potli bag, and embroidered juttis.`;
  const washCare = `Dry clean only recommended. Store in a breathable cotton muslin bag away from direct sunlight.`;

  const visualAttributes: AiVisionVisualAttributes = {
    primaryColor: color.split("&")[0].trim(),
    secondaryColor: color.includes("&") ? color.split("&")[1].trim() : undefined,
    metallicZari: color.toLowerCase().includes("gold") ? "Antique Gold Zari" : color.toLowerCase().includes("silver") ? "Silver Zari" : "Tonal Accents",
    weaveTexture: fabric,
    embroideryTechniques: [work.split(",")[0].trim(), "Artisanal Border Work"],
    motifs: ["Traditional Floral Motifs", "Artisan Border Trim"],
    borderStyle: "Finished artisanal border with fine edge binding",
    silhouette: categorySlug === "lehengas" ? "Flared Kalidar Lehenga with Blouse & Dupatta" : categorySlug === "sarees" ? "6-Yard Draped Saree with Running Blouse Piece" : `${categoryName} Silhouette`,
    setPieces: categorySlug === "lehengas" ? ["Lehenga Skirt", "Choli Blouse", "Embroidered Dupatta"] : categorySlug === "sarees" ? ["Saree", "Unstitched Blouse Piece"] : [categoryName],
    necklineAndSleeve: categorySlug === "lehengas" || categorySlug === "anarkali-suits" ? "Sweetheart neckline & elbow sleeves" : undefined,
    visualClarity: "standard",
  };

  const visualSummary =
    `🎨 VISUAL CRAFT BREAKDOWN:\n` +
    `• Palette: ${visualAttributes.primaryColor}${visualAttributes.metallicZari ? ` with ${visualAttributes.metallicZari}` : ""}\n` +
    `• Weave & Fabric: ${visualAttributes.weaveTexture}\n` +
    `• Karigari: ${visualAttributes.embroideryTechniques.join(", ")}\n` +
    `• Motifs: ${visualAttributes.motifs.join(", ")}\n` +
    (visualAttributes.borderStyle ? `• Border: ${visualAttributes.borderStyle}\n` : "") +
    (visualAttributes.setPieces && visualAttributes.setPieces.length > 0 ? `• Set Components: ${visualAttributes.setPieces.join(" + ")}\n` : "");

  const formattedText =
    `${shortDescription}\n\n` +
    `${longDescription}\n\n` +
    `${visualSummary}\n` +
    `🌟 KEY HIGHLIGHTS:\n` +
    highlights.map((h) => `• ${h}`).join("\n") +
    `\n\n` +
    `✨ STYLING ADVICE:\n${stylingTips}\n\n` +
    `🧼 CARE INSTRUCTIONS:\n${washCare}\n\n` +
    `👑 AALM VASTRALAY EXCLUSIVE — Handcrafted Luxury Heritage`;

  return {
    title,
    categorySlug,
    categoryName,
    categoryId,
    fabric,
    color,
    work,
    craftType: work,
    occasion,
    suggestedPrice,
    suggestedMrp,
    shortDescription,
    longDescription,
    highlights,
    tags,
    stylingTips,
    washCare,
    formattedText,
    provider: "fallback",
    visualAttributes,
  };
}

/**
 * Tier 2 Backup: Calls Pollinations.ai multimodal vision endpoint
 * when primary Gemini API is unconfigured or rate-limited.
 */
async function callPollinationsVision(
  imageDataUrl: string,
  systemInstructions: string
): Promise<(Partial<AiVisionAnalysisResult> & { visualAttributes?: Partial<AiVisionVisualAttributes> }) | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7_000); // 7s fail-soft timeout

  try {
    const res = await fetch("https://text.pollinations.ai/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${systemInstructions}\n\nSTRICT INSTRUCTION: Output ONLY raw JSON matching the requested schema. No code fences.`,
              },
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
            ],
          },
        ],
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") return null;

    const clean = content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(clean);
    return parsed;
  } catch (err) {
    console.warn("[VisionEngine] Pollinations backup attempt failed or timed out:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Unified Multimodal Vision AI: Analyzes garment images and generates concise,
 * high-converting luxury boutique product copy with 3-tier resilience:
 * Tier 1: Gemini 2.5 Flash -> Tier 2: Pollinations.ai -> Tier 3: Deterministic Craft Engine
 */
export async function executeAiVisionAnalysis(
  options: AiVisionAnalysisOptions
): Promise<AiVisionAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const imageInput = options.imageUrl || (options.imageBase64 ? `data:${options.mimeType || "image/jpeg"};base64,${options.imageBase64}` : "");

  if (!imageInput) {
    return generateDeterministicVisionFallback("ethnic-wear", options.categoriesList);
  }

  // 1. Prepare Base64 image payload
  const imagePayload = await prepareImageForVisionAnalysis(imageInput);
  if (!imagePayload) {
    return generateDeterministicVisionFallback(imageInput, options.categoriesList);
  }

  // 2. Prepare concise, high-converting luxury prompt grounded strictly in visual facts
  const systemInstructions =
    `You are the Senior Textile Appraiser for 'Aalm Vastralay' (आलम वस्त्रालय), India's premier luxury ethnic fashion marketplace.\n` +
    `Perform a rigorous, grounded visual analysis of this garment photograph. Every single detail you write must be directly observable in the photo.\n` +
    `STRICT ZERO-HALLUCINATION POLICY:\n` +
    `- Do NOT invent unverified claims, fictional stone names, or fake thread counts. Rely 100% on what is visible.\n` +
    `- Observe EXACT colors (primary body hue, border/pallu accents, metallic thread type).\n` +
    `- Observe EXACT fabric texture (e.g. lustrous silk, dense velvet, sheer tissue organza, textured brocade, flowing georgette).\n` +
    `- Observe EXACT surface work (e.g. zardozi, gota patti, mirror/shisha, cutdana, sequins, threadwork, kadwa weave).\n` +
    `- Observe EXACT silhouette & set pieces visible in this photo.\n` +
    `- If neckline or sleeves are not visible in the photo, write 'Not visible in photo'.\n` +
    `CRITICAL REQUIREMENT: Write concise, crisp, high-converting luxury boutique copy (no verbose filler text). Every word must convey prestige and authentic craftsmanship.\n` +
    `Return ONLY a raw valid JSON object with EXACTLY this structure (no markdown fences, no explanatory text):\n` +
    `{\n` +
    `  "title": "Evocative, crisp luxury title under 70 chars (e.g. 'Crimson Red Velvet Zardozi Bridal Lehenga')",\n` +
    `  "categorySlug": "sarees" | "lehengas" | "anarkali-suits" | "salwar-kameez" | "gowns" | "sherwanis" | "kurta-sets" | "nehru-jackets" | "indo-western" | "dupattas" | "jewellery" | "footwear",\n` +
    `  "categoryName": "Human-friendly category name (e.g. 'Lehengas' or 'Sarees')",\n` +
    `  "fabric": "Exact fabric & weave observed in the image",\n` +
    `  "color": "Specific regal ethnic color tone observed (e.g. 'Crimson Red & Antique Gold')",\n` +
    `  "work": "Authentic embroidery/karigari technique observed in the image",\n` +
    `  "occasion": "Primary occasion matching the garment richness",\n` +
    `  "suggestedPrice": 45000,\n` +
    `  "suggestedMrp": 60000,\n` +
    `  "shortDescription": "1-2 punchy, evocative sentences capturing the silhouette and artisan majesty.",\n` +
    `  "longDescription": "2 concise paragraphs (around 70-90 words total) detailing the weave touch, regal drape, and styling charisma.",\n` +
    `  "highlights": ["4 clear bullet points: Fabric, Work, Occasion, Inclusions"],\n` +
    `  "tags": ["6 high-intent Indian eCommerce search tags"],\n` +
    `  "stylingTips": "1 sentence expert advice on pairing with heritage jewellery, footwear, and accessories.",\n` +
    `  "washCare": "Clear traditional garment care tailored to detected fabric.",\n` +
    `  "visualAttributes": {\n` +
    `    "primaryColor": "Dominant body hue",\n` +
    `    "secondaryColor": "Secondary or accent hue",\n` +
    `    "metallicZari": "Metallic thread observed ('Antique Gold Zari', 'Silver Zari', 'Rose Gold', or 'None')",\n` +
    `    "weaveTexture": "Observed physical weave and sheen",\n` +
    `    "embroideryTechniques": ["List of exact surface techniques observed"],\n` +
    `    "motifs": ["List of exact patterns/motifs observed (e.g. Floral Jaal, Paisley, Chevron)"],\n` +
    `    "borderStyle": "Border or hemline construction observed",\n` +
    `    "silhouette": "Garment cut and drape structure",\n` +
    `    "setPieces": ["Pieces physically visible in this photo"],\n` +
    `    "necklineAndSleeve": "Neckline and sleeve style if visible, otherwise 'Not visible in photo'",\n` +
    `    "visualClarity": "high"\n` +
    `  }\n` +
    `}`;

  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  let parsedResult: (Partial<AiVisionAnalysisResult> & { visualAttributes?: Partial<AiVisionVisualAttributes> }) | null = null;
  let activeProvider: "gemini" | "pollinations" = "gemini";

  if (apiKey) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [
            {
              parts: [
                imagePayload,
                { text: systemInstructions },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 14_000);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini Vision ${model} HTTP ${res.status}: ${errText}`);
        }

        const json = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };

        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("Empty response from vision model");

        const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        parsedResult = JSON.parse(cleanJson);
        break;
      } catch (err) {
        console.warn(`[VisionEngine] ${model} attempt failed:`, err);
      }
    }
  }

  // Tier 2: Pollinations.ai Vision Backup (Free, keyless multimodal fallback)
  if (!parsedResult || !parsedResult.title) {
    const pollinationsPayload = `data:${imagePayload.inlineData.mimeType};base64,${imagePayload.inlineData.data}`;
    const pollinationsResult = await callPollinationsVision(pollinationsPayload, systemInstructions);
    if (pollinationsResult && pollinationsResult.title) {
      parsedResult = pollinationsResult;
      activeProvider = "pollinations";
    }
  }

  // Tier 3: Local Deterministic Karigari Engine (100% Offline Fail-Safe)
  if (!parsedResult || !parsedResult.title) {
    return generateDeterministicVisionFallback(imageInput, options.categoriesList);
  }

  const categorySlug = (parsedResult.categorySlug || "lehengas").toLowerCase();
  const categoryName = parsedResult.categoryName || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const matchedCat = options.categoriesList?.find(
    (c) =>
      c.slug === categorySlug ||
      c.slug.includes(categorySlug) ||
      categorySlug.includes(c.slug) ||
      c.name.toLowerCase() === categoryName.toLowerCase() ||
      c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
      categoryName.toLowerCase().includes(c.name.toLowerCase())
  );

  const rawVa = parsedResult.visualAttributes;
  const visualAttributes: AiVisionVisualAttributes = {
    primaryColor: rawVa?.primaryColor || parsedResult.color?.split("&")[0]?.trim() || "Regal Ethnic Hue",
    secondaryColor: rawVa?.secondaryColor || (parsedResult.color?.includes("&") ? parsedResult.color.split("&")[1].trim() : undefined),
    metallicZari: rawVa?.metallicZari || (parsedResult.color?.toLowerCase().includes("gold") ? "Antique Gold Zari" : "Tonal Accents"),
    weaveTexture: rawVa?.weaveTexture || parsedResult.fabric || "Artisanal Weave",
    embroideryTechniques: Array.isArray(rawVa?.embroideryTechniques) && rawVa.embroideryTechniques.length > 0
      ? rawVa.embroideryTechniques
      : [parsedResult.work || "Handcrafted Embroidery"],
    motifs: Array.isArray(rawVa?.motifs) && rawVa.motifs.length > 0
      ? rawVa.motifs
      : ["Traditional Indian Motifs"],
    borderStyle: rawVa?.borderStyle || "Artisanal Border",
    silhouette: rawVa?.silhouette || `${categoryName} Silhouette`,
    setPieces: Array.isArray(rawVa?.setPieces) && rawVa.setPieces.length > 0
      ? rawVa.setPieces
      : [categoryName],
    necklineAndSleeve: rawVa?.necklineAndSleeve,
    visualClarity: "high",
  };

  const visualBreakdown =
    `🎨 VISUAL CRAFT BREAKDOWN:\n` +
    `• Palette: ${visualAttributes.primaryColor}${visualAttributes.metallicZari && visualAttributes.metallicZari !== "None" ? ` with ${visualAttributes.metallicZari}` : ""}\n` +
    `• Weave & Fabric: ${visualAttributes.weaveTexture}\n` +
    (visualAttributes.embroideryTechniques.length > 0 ? `• Karigari: ${visualAttributes.embroideryTechniques.join(", ")}\n` : "") +
    (visualAttributes.motifs.length > 0 ? `• Motifs: ${visualAttributes.motifs.join(", ")}\n` : "") +
    (visualAttributes.borderStyle ? `• Border: ${visualAttributes.borderStyle}\n` : "") +
    (visualAttributes.setPieces && visualAttributes.setPieces.length > 0 ? `• Set Components: ${visualAttributes.setPieces.join(" + ")}\n` : "");

  const formattedText =
    `${parsedResult.shortDescription ?? ""}\n\n` +
    `${parsedResult.longDescription ?? ""}\n\n` +
    `${visualBreakdown}\n` +
    `🌟 KEY HIGHLIGHTS:\n` +
    (parsedResult.highlights ?? []).map((h) => `• ${h}`).join("\n") +
    `\n\n` +
    `✨ STYLING ADVICE:\n${parsedResult.stylingTips ?? ""}\n\n` +
    `🧼 CARE INSTRUCTIONS:\n${parsedResult.washCare ?? ""}\n\n` +
    `👑 AALM VASTRALAY EXCLUSIVE — Handcrafted Luxury Heritage`;

  const work = parsedResult.work || "Artisanal Zari & Needlework";

  return {
    title: parsedResult.title.slice(0, 160),
    categorySlug: matchedCat ? matchedCat.slug : categorySlug,
    categoryName: matchedCat ? matchedCat.name : categoryName,
    categoryId: matchedCat?.id,
    fabric: parsedResult.fabric || "Pure Silk Blend",
    color: parsedResult.color || "Royal Heritage Palette",
    work,
    craftType: work,
    occasion: parsedResult.occasion || "Weddings & Celebrations",
    suggestedPrice: Number(parsedResult.suggestedPrice) || 25000,
    suggestedMrp: Number(parsedResult.suggestedMrp) || 35000,
    shortDescription: parsedResult.shortDescription || "",
    longDescription: parsedResult.longDescription || "",
    highlights: Array.isArray(parsedResult.highlights) ? parsedResult.highlights : [],
    tags: Array.isArray(parsedResult.tags) ? parsedResult.tags : [],
    stylingTips: parsedResult.stylingTips || "",
    washCare: parsedResult.washCare || "Dry clean only.",
    formattedText,
    provider: activeProvider,
    visualAttributes,
  };
}
