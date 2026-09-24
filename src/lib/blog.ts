export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  author: string;
  category: string;
  coverImage: string;
  seoDescription: string;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "bridal-lehenga-trends-2026",
    title: "Top 2026 Bridal Lehenga Trends: Jewel Tones, Lightweight Can-Can & Heritage Zardozi",
    excerpt: "Discover the newest bridal couture directions for this wedding season — from deep ruby velvet to featherweight silhouettes designed for dancing.",
    date: "March 15, 2026",
    readingTime: "5 min read",
    author: "Aalm Vastralay Bridal Atelier",
    category: "Bridal Couture",
    coverImage: "/images/bridal-lehenga.jpg",
    seoDescription: "Explore 2026 bridal lehenga trends including ruby red velvet, lightweight can-can flare, pure gold zari embroidery, and bespoke customizations.",
    sections: [
      {
        heading: "1. The Renaissance of Deep Crimson and Royal Burgundy",
        paragraphs: [
          "While pastel lehengas enjoyed several seasons in the limelight, 2026 marks the undeniable return of regal jewel tones. Deep ruby red, royal carmine, and midnight burgundy are dominating wedding moodboards.",
          "Brides today want an ensemble that evokes timeless heritage. Hand-embroidered zardozi and dabka work on rich micro-velvet and pure raw silk fabrics create an aura of heirloom nobility that photographs with exceptional warmth under royal mandap lighting.",
        ],
      },
      {
        heading: "2. Engineered Lightweight Flare (Can-Can Innovation)",
        paragraphs: [
          "A major trend reshaping Indian bridal fashion is comfort. Brides want royal volume without feeling weighed down by 15-kilogram skirts. Modern lehengas use structured, high-grade flexible nylon mesh and detachable inner can-can skirts.",
          "This architectural technique creates dramatic 16-kali and 24-kali volume while trimming the skirt weight by over 40%, allowing brides to glide comfortably through the sangeet and pheras.",
        ],
      },
      {
        heading: "3. Dual Dupatta Draping with Contrast Zari Borders",
        paragraphs: [
          "The two-dupatta aesthetic remains essential for Indian brides: a heavily embroidered velvet or silk shawl draped gracefully over the shoulder or chest, paired with a featherlight sheer organza or tulle veil pinned over the bridal bun.",
          "At Aalm Vastralay, our Kalyanipur bridal stylists coordinate contrasting hand-scalloped borders so each dupatta frames the bridal jewellery without overpowering the necklace.",
        ],
      },
    ],
  },
  {
    slug: "banarasi-silk-care-guide",
    title: "How to Care for & Preserve Pure Banarasi Silk Sarees for Generations",
    excerpt: "Pure Katan silk and real zari require delicate handling. Master our 6 golden preservation rules to keep your heirloom sarees pristine forever.",
    date: "March 10, 2026",
    readingTime: "4 min read",
    author: "Heritage Weaves Division",
    category: "Fabric Care",
    coverImage: "/images/dupatta-jewellery.jpg",
    seoDescription: "Expert guide on preserving pure Banarasi silk sarees. Learn proper folding, muslin cloth wrapping, aeration, and dry-cleaning best practices.",
    sections: [
      {
        heading: "1. Never Hang a Heavy Silk Saree on Metal Hangers",
        paragraphs: [
          "Pure mulberry Katan silk and hand-woven zari are delicate structural weaves. Gravity causes heavy metal or plastic hangers to stretch and weaken the warp threads along the shoulder fold, eventually leading to tears.",
          "Instead, always fold your Banarasi saree neatly and store it flat inside breathable, pure unbleached cotton or muslin saree bags. Never store silk in plastic bags, which trap humidity and cause zari oxidation.",
        ],
      },
      {
        heading: "2. Change the Fold Creases Every 4 to 6 Months",
        paragraphs: [
          "Keeping a heavy silk saree folded in the exact same lines for years causes permanent stress lines and fiber fractures along the sharp bends.",
          "Every few months, unfold your saree in a clean, shaded room, let it breathe in cool air for 15 minutes, and refold it along different fold lines.",
        ],
      },
      {
        heading: "3. Professional Dry Cleaning Only",
        paragraphs: [
          "Water washing or household detergents will strip the natural sericin coating of pure mulberry silk and discolor the metallic zari threads.",
          "Always trust reputable dry cleaners experienced in handling pure Indian handloom textiles. Inform them specifically of any spot stains before processing.",
        ],
      },
    ],
  },
  {
    slug: "groom-sherwani-styling-guide",
    title: "The Ultimate Groom Styling Guide: Choosing Sherwanis, Safas & Stoles",
    excerpt: "Everything the modern Indian groom needs to coordinate colors with the bride, select royal fabrics, and balance majestic accessories.",
    date: "March 05, 2026",
    readingTime: "6 min read",
    author: "Aalm Vastralay Groom Studio",
    category: "Men's Ethnic",
    coverImage: "/images/sherwani.jpg",
    seoDescription: "Complete groom styling guide for Indian weddings. How to choose sherwani fabrics, color-coordinate with the bride, and tie royal safas.",
    sections: [
      {
        heading: "1. Harmonies of Ivory, Champagne, and Royal Gold",
        paragraphs: [
          "Ivory, oyster white, and antique gold continue to reign supreme for groom sherwanis. These classic royal tones offer a striking contrast when standing beside a bride adorned in deep crimson, scarlet, or royal pink.",
          "Self-woven brocades, subtle chikankari threadwork, and tonal zardozi embroidery on pure silk or matka silk grant an understated majestic presence.",
        ],
      },
      {
        heading: "2. Perfecting the Royal Safa (Turban) and Kalgi",
        paragraphs: [
          "The safa crowns the groom's wedding ensemble. Coordinate your safa fabric with your bride's secondary dupatta color — pale peach, blush pink, or heritage Banarasi red.",
          "Accentuate the turban with an antique kundan or emerald kalgi pinned at the center-left to add royal vintage grandeur.",
        ],
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
