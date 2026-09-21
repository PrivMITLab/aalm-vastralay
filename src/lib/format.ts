/**
 * Display formatting helpers.
 *
 * `formatMoney` renders amounts using the admin-configured currency symbol + display
 * conversion rate. Order/invoice arithmetic always stays in INR on the server, so the
 * numbers customers are charged never drift – only the way they are printed changes.
 */

export type DisplayConfig = {
  currencySymbol: string;
  currencyCode: string;
  rateFromINR: number;
  rounding: "none" | "nearest1" | "nearest5" | "nearest10";
  weightUnit: "kg" | "g";
};

let display: DisplayConfig = { currencySymbol: "₹", currencyCode: "INR", rateFromINR: 1, rounding: "none", weightUnit: "kg" };

/** Called by the settings loader on every read (display-only cache). */
export function refreshDisplayConfig(config: Partial<DisplayConfig>) {
  display = { ...display, ...config };
}

export function currentDisplay(): DisplayConfig {
  return display;
}

function applyRounding(value: number) {
  switch (display.rounding) {
    case "nearest1":
      return Math.round(value);
    case "nearest5":
      return Math.round(value / 5) * 5;
    case "nearest10":
      return Math.round(value / 10) * 10;
    default:
      return value;
  }
}

/** Formats an INR amount for display (optionally converted + rounded per settings). */
export function formatMoney(inr: number, opts: { compact?: boolean; raw?: boolean } = {}) {
  const converted = inr * (opts.raw ? 1 : display.rateFromINR);
  const value = applyRounding(converted);
  const symbol = opts.raw ? "₹" : display.currencySymbol;
  const fraction = Math.abs(value % 1) < 0.005 ? 0 : 2;
  const formatted = new Intl.NumberFormat(opts.raw ? "en-IN" : localeFor(display.currencyCode), {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
    notation: opts.compact && Math.abs(value) >= 100000 ? "compact" : "standard",
  }).format(value);
  return `${symbol}${formatted}`;
}

function localeFor(code: string) {
  switch (code) {
    case "USD":
      return "en-US";
    case "GBP":
      return "en-GB";
    case "EUR":
      return "de-DE";
    case "AED":
      return "en-AE";
    default:
      return "en-IN";
  }
}

/** Grams → configured unit ("1.2 kg" / "650 g"). */
export function formatWeight(grams: number | null | undefined) {
  const g = Number(grams ?? 0);
  if (!g) return "";
  if (display.weightUnit === "kg") {
    const kg = g / 1000;
    return `${kg % 1 === 0 ? kg : kg.toFixed(2)} kg`;
  }
  return `${Math.round(g)} g`;
}

/* ------------------------------------------------------------------ */
/*  Roman (Hinglish) transliteration of Devanagari + Indian languages  */
/*  – gives the "translit"-style bilingual feel across the UI.         */
/* ------------------------------------------------------------------ */

const DEVANAGARI_MAP: Array<[string, string]> = [
  ["अ", "a"], ["आ", "aa"], ["इ", "i"], ["ई", "ee"], ["उ", "u"], ["ऊ", "oo"], ["ऋ", "ri"], ["ए", "e"], ["ऐ", "ai"], ["ओ", "o"], ["औ", "au"], ["अं", "an"],
  ["क", "ka"], ["ख", "kha"], ["ग", "ga"], ["घ", "gha"], ["च", "cha"], ["छ", "chha"], ["ज", "ja"], ["झ", "jha"], ["ट", "ta"], ["ठ", "tha"], ["ड", "da"], ["ढ", "dha"],
  ["त", "ta"], ["थ", "tha"], ["द", "da"], ["ध", "dha"], ["न", "na"], ["प", "pa"], ["फ", "pha"], ["ब", "ba"], ["भ", "bha"], ["म", "ma"], ["य", "ya"], ["र", "ra"],
  ["ल", "la"], ["व", "va"], ["श", "sha"], ["ष", "sha"], ["स", "sa"], ["ह", "ha"], ["ळ", "la"], ["ज़", "za"], ["फ़", "fa"],
  ["ा", "aa"], ["ि", "i"], ["ी", "ee"], ["ु", "u"], ["ू", "oo"], ["े", "e"], ["ै", "ai"], ["ो", "o"], ["ौ", "au"], ["ं", "n"], ["ँ", "n"], ["ः", "h"],
  ["्", ""], ["़", ""], ["१", "1"], ["२", "2"], ["३", "3"], ["४", "4"], ["५", "5"], ["६", "6"], ["७", "7"], ["८", "8"], ["९", "9"], ["०", "0"],
];

const WORD_TRANSLIT: Record<string, string> = {
  आलम: "Aalm", वस्त्रालय: "Vastralay", लहंगा: "Lehenga", साड़ी: "Saree", शेरवानी: "Sherwani", कुर्ता: "Kurta",
  दुल्हन: "Dulhan", शादी: "Shaadi", त्योहार: "Tyohaar", गहने: "Gahne", जूते: "Joote", बच्चे: "Bachche",
};

export function toRoman(input: string): string {
  if (!input) return "";
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const two = input.slice(i, i + 2);
    const three = input.slice(i, i + 3);
    if (WORD_TRANSLIT[three]) {
      out += WORD_TRANSLIT[three];
      i += 2;
      continue;
    }
    if (WORD_TRANSLIT[two]) {
      out += WORD_TRANSLIT[two];
      i += 1;
      continue;
    }
    const pair = DEVANAGARI_MAP.find(([k]) => k === two);
    if (pair && pair[0].length === 2) {
      out += pair[1];
      i += 1;
      continue;
    }
    const single = DEVANAGARI_MAP.find(([k]) => k === input[i]);
    out += single ? single[1] : input[i];
  }
  return out.replace(/\s+/g, " ").trim();
}

/** Bilingual label: "नमस्ते / Namaste". Admins can disable the secondary line. */
export function bilingual(primary: string, secondary?: string) {
  if (!secondary) return primary;
  return `${primary} · ${secondary}`;
}

export function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

export function isStrongPassword(password: string) {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}
