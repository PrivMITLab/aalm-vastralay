import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAiRateLimit, executeAiCompletion, getCachedAiResponse, setCachedAiResponse, computeAiCacheKey } from "@/lib/ai/client";

export const dynamic = "force-dynamic";

export type GenerateDescriptionInput = {
  title: string;
  categoryName?: string;
  fabric?: string;
  occasion?: string;
  color?: string;
  price?: number;
  tone?: "royal" | "modern" | "festive" | "bridal";
};

export type GenerateDescriptionOutput = {
  shortDescription: string;
  longDescription: string;
  highlights: string[];
  seoKeywords: string[];
  stylingTips: string;
  washCare: string;
  formattedText: string;
};

/**
 * Deterministic Indian ethnic wear copy generator used when AI keys are unset or quotas are exceeded.
 */
function generateDeterministicEthnicCopy(input: GenerateDescriptionInput): GenerateDescriptionOutput {
  const title = input.title.trim();
  const category = (input.categoryName || "Ethnic Wear").trim();
  const fabric = input.fabric || "Premium Handloom Silk Blend";
  const occasion = input.occasion || "Wedding & Festive Celebrations";
  const color = input.color || "Timeless Heritage Shade";
  const price = input.price ? `₹${input.price.toLocaleString("en-IN")}` : "Luxury Collection";

  const shortDescription = `Experience timeless grace with our handcrafted ${title}, woven in pure ${fabric} for unforgettable celebrations.`;

  const longDescription =
    `Introducing the magnificent ${title} from Aalm Vastralay's exclusive festive curation. Handcrafted with meticulous precision, this ${category.toLowerCase()} combines artisanal heritage with contemporary elegance. The rich ${fabric} drapes effortlessly, catching the light with subtle sophistication.\n\n` +
    `Designed for memorable moments — from grand wedding receptions and sangeet nights to intimate festive gatherings. Every fold reflects the generational karigari of master Indian weavers, making it a treasured addition to your traditional wardrobe. Pair with heritage jewellery for an opulent, royal ensemble.`;

  const highlights = [
    `Authentic Craftsmanship: Hand-finished ${category} tailored for superior comfort and opulent drape.`,
    `Fabric & Weave: Premium ${fabric} offering a lustrous sheen and breathable wear.`,
    `Occasion: Ideal for ${occasion}, cultural soirees, and bridal celebrations.`,
    `Color Palette: Rich ${color} that complements all Indian skin tones beautifully.`,
    `Value: Authentic boutique quality at ${price} with zero compromise on craftsmanship.`,
  ];

  const seoKeywords = [
    `${title.toLowerCase()}`,
    `${fabric.toLowerCase()} ${category.toLowerCase()}`,
    `designer ${category.toLowerCase()} online`,
    `wedding ${category.toLowerCase()} india`,
    `aalm vastralay ethnic wear`,
    `buy ${category.toLowerCase()} cash on delivery`,
  ];

  const stylingTips = `Style this gorgeous ${category} with antique gold or kundan jhumkas, a classic embellished potli bag, and embroidered juttis for a regal royal look.`;
  const washCare = `Dry clean only recommended to preserve the delicate weave and fabric sheen. Store in a breathable cotton muslin bag away from direct sunlight.`;

  const formattedText =
    `${shortDescription}\n\n` +
    `${longDescription}\n\n` +
    `🌟 KEY HIGHLIGHTS:\n` +
    highlights.map((h) => `• ${h}`).join("\n") +
    `\n\n` +
    `✨ STYLING ADVICE:\n${stylingTips}\n\n` +
    `🧼 CARE INSTRUCTIONS:\n${washCare}`;

  return {
    shortDescription,
    longDescription,
    highlights,
    seoKeywords,
    stylingTips,
    washCare,
    formattedText,
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json(
        { error: "Unauthorized. Only verified sellers and admins can access the AI Copywriter." },
        { status: 403 }
      );
    }

    const rateLimit = checkAiRateLimit(`desc:${user.id}`);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: `Free AI rate limit exceeded. Please wait ${rateLimit.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = (await req.json()) as GenerateDescriptionInput;
    if (!body.title || body.title.trim().length < 3) {
      return NextResponse.json({ error: "Product title is required (min 3 characters)." }, { status: 400 });
    }

    const cacheKey = computeAiCacheKey("description", JSON.stringify(body));
    const cached = await getCachedAiResponse<GenerateDescriptionOutput>(cacheKey);
    if (cached) {
      return NextResponse.json({ ok: true, data: cached, provider: "cache", cached: true });
    }

    const systemPrompt =
      `You are the Senior Luxury Fashion Copywriter for 'Aalm Vastralay' (आलम वस्त्रालय), India's premier boutique marketplace for authentic Banarasi sarees, bridal lehengas, sherwanis, and luxury ethnic wear.\n` +
      `Your task is to generate compelling, high-converting, culturally nuanced product descriptions in English with natural, tasteful Hinglish touches (e.g., 'Karigari', 'Zari', 'Drape', 'Virasaat').\n` +
      `Return ONLY a raw valid JSON object with EXACTLY the following structure (no markdown fences, no explanatory text):\n` +
      `{\n` +
      `  "shortDescription": "1-2 punchy, evocative sentences highlighting the essence",\n` +
      `  "longDescription": "2 vivid paragraphs detailing the craftsmanship, fabric feel, weave, and heritage aura",\n` +
      `  "highlights": ["3 to 5 clear bullet points: Fabric, Work/Karigari, Occasion, Inclusions, Fit"],\n` +
      `  "seoKeywords": ["5 to 8 high-ranking Indian ecommerce search tags in Hinglish + English"],\n` +
      `  "stylingTips": "Expert bridal/festive styling suggestion with jewellery and footwear",\n` +
      `  "washCare": "Clear ethnic garment care instructions (dry clean, muslin cloth, etc.)"\n` +
      `}`;

    const userPrompt =
      `Product Title: ${body.title}\n` +
      `Category: ${body.categoryName || "Ethnic Wear"}\n` +
      `Fabric: ${body.fabric || "Silk / Fine Weave"}\n` +
      `Occasion: ${body.occasion || "Weddings, Festivals, Celebrations"}\n` +
      `Color/Palette: ${body.color || "Traditional"}\n` +
      `Price: ₹${body.price || "Contact"}\n` +
      `Tone: ${body.tone || "Royal & Elegant"}\n` +
      `Generate the structured JSON description.`;

    try {
      const result = await executeAiCompletion({
        systemPrompt,
        userPrompt,
        feature: "description",
        jsonMode: true,
        temperature: 0.35,
        maxTokens: 1200,
      });

      // Parse JSON safely
      const cleanJson = result.text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleanJson) as Partial<GenerateDescriptionOutput>;

      const formattedText =
        `${parsed.shortDescription ?? ""}\n\n` +
        `${parsed.longDescription ?? ""}\n\n` +
        `🌟 KEY HIGHLIGHTS:\n` +
        (parsed.highlights ?? []).map((h) => `• ${h}`).join("\n") +
        `\n\n` +
        `✨ STYLING ADVICE:\n${parsed.stylingTips ?? ""}\n\n` +
        `🧼 CARE INSTRUCTIONS:\n${parsed.washCare ?? ""}`;

      const finalOutput: GenerateDescriptionOutput = {
        shortDescription: parsed.shortDescription ?? "",
        longDescription: parsed.longDescription ?? "",
        highlights: parsed.highlights ?? [],
        seoKeywords: parsed.seoKeywords ?? [],
        stylingTips: parsed.stylingTips ?? "",
        washCare: parsed.washCare ?? "",
        formattedText,
      };

      await setCachedAiResponse(cacheKey, "description", finalOutput);
      return NextResponse.json({ ok: true, data: finalOutput, provider: result.provider, cached: false });
    } catch {
      // Graceful fallback to deterministic generator
      const fallbackOutput = generateDeterministicEthnicCopy(body);
      await setCachedAiResponse(cacheKey, "description", fallbackOutput);
      return NextResponse.json({ ok: true, data: fallbackOutput, provider: "fallback", cached: false });
    }
  } catch (err) {
    console.error("[generate-description route error]:", err);
    return NextResponse.json(
      { error: "Internal server error while generating description." },
      { status: 500 }
    );
  }
}
