export type ParsedSearchIntent = {
  categorySlug?: string;
  categoryName?: string;
  color?: string;
  fabric?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords: string[];
  explanation: string;
};

/**
 * Deterministic rule-based NLP parser for Indian Ethnic Wear and Hinglish phrases.
 */
export function parseEthnicQueryDeterministic(rawQuery: string): ParsedSearchIntent {
  const q = rawQuery.toLowerCase();
  const intent: ParsedSearchIntent = {
    keywords: [],
    explanation: "",
  };

  // Price detection (e.g. under 5000, under 5k, below 10000, 5000 tak, kam se kam 2000)
  const underMatch = q.match(/(?:under|below|less than|se kam|tak|max|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\s*k)?)/i);
  if (underMatch) {
    const valStr = underMatch[1].replace(/,/g, "").trim();
    let max = 0;
    if (valStr.endsWith("k")) {
      max = parseFloat(valStr.replace("k", "")) * 1000;
    } else {
      max = parseFloat(valStr);
    }
    if (!isNaN(max) && max > 0) {
      intent.maxPrice = max;
    }
  }

  // Above price detection
  const aboveMatch = q.match(/(?:above|more than|over|greater than|se jyada|se upar|min)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\s*k)?)/i);
  if (aboveMatch) {
    const valStr = aboveMatch[1].replace(/,/g, "").trim();
    let min = 0;
    if (valStr.endsWith("k")) {
      min = parseFloat(valStr.replace("k", "")) * 1000;
    } else {
      min = parseFloat(valStr);
    }
    if (!isNaN(min) && min > 0) {
      intent.minPrice = min;
    }
  }

  // Categories
  if (q.includes("saree") || q.includes("sari") || q.includes("साड़ी")) {
    intent.categorySlug = "sarees";
    intent.categoryName = "Sarees";
  } else if (q.includes("lehenga") || q.includes("lehnga") || q.includes("लहंगा")) {
    intent.categorySlug = "lehengas";
    intent.categoryName = "Lehengas";
  } else if (q.includes("sherwani") || q.includes("शेरवानी")) {
    intent.categorySlug = "sherwanis";
    intent.categoryName = "Sherwanis";
  } else if (q.includes("anarkali") || q.includes("अनारकली")) {
    intent.categorySlug = "anarkali-suits";
    intent.categoryName = "Anarkali Suits";
  } else if (q.includes("kurta") || q.includes("कुर्ता")) {
    intent.categorySlug = "kurtas";
    intent.categoryName = "Kurtas";
  } else if (q.includes("dupatta") || q.includes("दुपट्टा")) {
    intent.categorySlug = "dupattas";
    intent.categoryName = "Dupattas";
  }

  // Occasions
  if (q.includes("shaadi") || q.includes("wedding") || q.includes("dulhan") || q.includes("bridal") || q.includes("शादी")) {
    intent.occasion = "Wedding / Bridal";
  } else if (q.includes("haldi") || q.includes("हल्दी")) {
    intent.occasion = "Haldi";
  } else if (q.includes("mehendi") || q.includes("mehndi") || q.includes("मेहंदी")) {
    intent.occasion = "Mehendi";
  } else if (q.includes("sangeet") || q.includes("संगीत")) {
    intent.occasion = "Sangeet";
  } else if (q.includes("reception") || q.includes("पार्टी") || q.includes("party")) {
    intent.occasion = "Party & Reception";
  } else if (q.includes("puja") || q.includes("pooja") || q.includes("festive") || q.includes("diwali") || q.includes("chhath")) {
    intent.occasion = "Festive & Puja";
  }

  // Colors
  const colorMap: Record<string, string> = {
    laal: "Red",
    red: "Red",
    peela: "Yellow",
    yellow: "Yellow",
    gulabi: "Pink",
    pink: "Pink",
    hara: "Green",
    green: "Green",
    neela: "Blue",
    blue: "Blue",
    maroon: "Maroon",
    gold: "Gold",
    golden: "Gold",
    white: "White",
    safed: "White",
    black: "Black",
    kala: "Black",
    orange: "Orange",
    narangi: "Orange",
    purple: "Purple",
    jamuni: "Purple",
  };
  for (const [key, val] of Object.entries(colorMap)) {
    if (new RegExp(`\\b${key}\\b`, "i").test(q)) {
      intent.color = val;
      break;
    }
  }

  // Fabrics
  const fabrics = ["banarasi", "silk", "katan", "georgette", "chiffon", "velvet", "organza", "cotton", "tussar", "crepe", "chanderi", "zari"];
  for (const f of fabrics) {
    if (new RegExp(`\\b${f}\\b`, "i").test(q)) {
      intent.fabric = f.charAt(0).toUpperCase() + f.slice(1);
      break;
    }
  }

  // Remaining meaningful keywords
  const stopWords = new Set(["for", "under", "below", "with", "and", "the", "ke", "liye", "ka", "ki", "mein", "se", "kam", "tak", "chahiye", "dikhao"]);
  const words = q.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
  intent.keywords = words;

  // Build clean human-friendly explanation
  const parts = [];
  if (intent.occasion) parts.push(intent.occasion);
  if (intent.color) parts.push(intent.color);
  if (intent.fabric) parts.push(intent.fabric);
  if (intent.categoryName) parts.push(intent.categoryName);
  if (intent.maxPrice) parts.push(`Under ₹${intent.maxPrice.toLocaleString("en-IN")}`);
  if (intent.minPrice) parts.push(`Above ₹${intent.minPrice.toLocaleString("en-IN")}`);

  intent.explanation = parts.length > 0 ? parts.join(" · ") : rawQuery;
  return intent;
}
