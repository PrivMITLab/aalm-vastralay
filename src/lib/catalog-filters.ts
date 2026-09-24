export interface ColorOption {
  name: string;
  slug: string;
  hex: string;
  bgClass: string;
}

export interface OccasionOption {
  name: string;
  slug: string;
  emoji: string;
  tag: string;
  colorClass: string;
  description: string;
}

export interface FabricOption {
  name: string;
  slug: string;
  tag: string;
}

export const CATALOG_COLORS: ColorOption[] = [
  { name: "Red", slug: "red", hex: "#dc2626", bgClass: "bg-red-600" },
  { name: "Maroon", slug: "maroon", hex: "#881337", bgClass: "bg-rose-900" },
  { name: "Mustard Yellow", slug: "yellow", hex: "#eab308", bgClass: "bg-yellow-500" },
  { name: "Emerald Green", slug: "green", hex: "#16a34a", bgClass: "bg-green-600" },
  { name: "Rani Pink", slug: "pink", hex: "#db2777", bgClass: "bg-pink-600" },
  { name: "Royal Blue", slug: "blue", hex: "#2563eb", bgClass: "bg-blue-600" },
  { name: "Pastel Peach", slug: "peach", hex: "#f97316", bgClass: "bg-orange-400" },
  { name: "Royal Gold", slug: "gold", hex: "#ca8a04", bgClass: "bg-amber-600" },
  { name: "Classic Black", slug: "black", hex: "#18181b", bgClass: "bg-zinc-900" },
];

export const CATALOG_OCCASIONS: OccasionOption[] = [
  {
    name: "Haldi Ceremony",
    slug: "haldi",
    emoji: "💛",
    tag: "haldi",
    colorClass: "from-amber-500 to-yellow-400",
    description: "Vibrant yellow lehengas, kurtas & dupattas",
  },
  {
    name: "Mehendi Night",
    slug: "mehendi",
    emoji: "🌿",
    tag: "mehendi",
    colorClass: "from-emerald-600 to-teal-500",
    description: "Rich emerald green, olive & mint designs",
  },
  {
    name: "Sangeet Glam",
    slug: "sangeet",
    emoji: "✨",
    tag: "sangeet",
    colorClass: "from-purple-600 to-pink-500",
    description: "Sequins, metallic shimmer & mirror work",
  },
  {
    name: "Wedding & Baraat",
    slug: "wedding",
    emoji: "👑",
    tag: "wedding",
    colorClass: "from-rose-700 to-red-600",
    description: "Bridal velvet lehengas & groom sherwanis",
  },
  {
    name: "Reception & Cocktail",
    slug: "reception",
    emoji: "🥂",
    tag: "reception",
    colorClass: "from-blue-700 to-indigo-800",
    description: "Navy blue, wine & regal cocktail gowns",
  },
  {
    name: "Festive & Puja",
    slug: "festive",
    emoji: "🪔",
    tag: "festive",
    colorClass: "from-orange-600 to-amber-500",
    description: "Traditional banarasi & silk sarees",
  },
];

export const CATALOG_FABRICS: FabricOption[] = [
  { name: "Pure Silk", slug: "silk", tag: "silk" },
  { name: "Banarasi", slug: "banarasi", tag: "banarasi" },
  { name: "Georgette", slug: "georgette", tag: "georgette" },
  { name: "Royal Velvet", slug: "velvet", tag: "velvet" },
  { name: "Chiffon", slug: "chiffon", tag: "chiffon" },
  { name: "Organza", slug: "organza", tag: "organza" },
  { name: "Chanderi", slug: "chanderi", tag: "chanderi" },
  { name: "Pure Cotton", slug: "cotton", tag: "cotton" },
];

/**
 * Filter match helper for testing and in-memory evaluation
 */
export function matchesVisualFilters(
  product: {
    title: string;
    description?: string | null;
    tags?: string[] | null;
    variants?: { color?: string | null }[];
  },
  filters: {
    occasion?: string;
    color?: string;
    fabric?: string;
  },
): boolean {
  const tags = (product.tags ?? []).map((t) => t.toLowerCase());
  const title = product.title.toLowerCase();
  const desc = (product.description ?? "").toLowerCase();

  if (filters.occasion) {
    const target = filters.occasion.toLowerCase();
    const tagMatch = tags.some((t) => t.includes(target) || target.includes(t));
    const titleMatch = title.includes(target);
    const descMatch = desc.includes(target);
    if (!tagMatch && !titleMatch && !descMatch) return false;
  }

  if (filters.color) {
    const target = filters.color.toLowerCase();
    const tagMatch = tags.some((t) => t.includes(target) || target.includes(t));
    const titleMatch = title.includes(target);
    const variantMatch = (product.variants ?? []).some(
      (v) => v.color && v.color.toLowerCase().includes(target),
    );
    if (!tagMatch && !titleMatch && !variantMatch) return false;
  }

  if (filters.fabric) {
    const target = filters.fabric.toLowerCase();
    const tagMatch = tags.some((t) => t.includes(target) || target.includes(t));
    const titleMatch = title.includes(target);
    const descMatch = desc.includes(target);
    if (!tagMatch && !titleMatch && !descMatch) return false;
  }

  return true;
}
