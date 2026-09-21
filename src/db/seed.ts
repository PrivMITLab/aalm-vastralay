import { config } from "dotenv";
config();
import { sql } from "drizzle-orm";
import { db, pool } from "./index";
import {
  categories,
  coupons,
  notifications,
  orderItems,
  orders,
  productVariants,
  products,
  reviews,
  settings,
  stores,
  users,
} from "./schema";
import { hashPassword } from "../lib/password";
import { slugify } from "../lib/utils";

/* ----------------------------- demo accounts ----------------------------- */

export const DEMO_ACCOUNTS = [
  { label: "Customer", email: "priya@example.com", password: "Priya@123" },
  { label: "Seller", email: "rajwada@seller.com", password: "Seller@123" },
  { label: "Admin", email: "admin@aalmvastralay.com", password: "Admin@123" },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

/** Realistic shipping weights so delivery charges & courier labels are meaningful. */
const WEIGHTS: Record<string, number> = {
  lehengas: 2800,
  gowns: 1400,
  sarees: 900,
  sherwanis: 2000,
  "kurta-sets": 800,
  "nehru-jackets": 600,
  "indo-western": 1900,
  "anarkali-suits": 1100,
  "girls-ethnic": 600,
  "boys-ethnic": 700,
  dupattas: 250,
  jewellery: 350,
};
const KIDS = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"];

type SeedProduct = {
  title: string;
  cat: string;
  store: string;
  price: number;
  mrp: number;
  images: string[];
  tags: string[];
  desc: string;
  featured?: boolean;
  sizes?: string[];
  colors?: string[];
  stockPer?: number;
  stock?: number;
  video?: string;
};

const PRODUCTS: SeedProduct[] = [
  {
    title: "Scarlet Zardozi Bridal Lehenga Set",
    cat: "lehengas",
    store: "rajwada",
    price: 24999,
    mrp: 42999,
    images: ["/images/bridal-lehenga.jpg", "/images/dupatta-jewellery.jpg", "/images/hero.jpg"],
    tags: ["bridal", "lehenga", "zardozi", "wedding", "red"],
    featured: true,
    sizes: SIZES,
    colors: ["Red", "Maroon"],
    stockPer: 4,
    desc: "A show-stopping bridal lehenga in rich scarlet raw silk, hand-embroidered with zardozi, dabka and sequin work over 45 days by our Jaipur karigars. Comes with a matching choli (unstitched blouse fabric) and two dupattas – a heavy embroidered net dupatta and a lightweight veil.\n\nCan-can and lining included. Dry clean only. Custom blouse stitching available on request.",
  },
  {
    title: "Regal Red Velvet Bridal Lehenga with Double Dupatta",
    cat: "lehengas",
    store: "rajwada",
    price: 32499,
    mrp: 54999,
    images: ["/images/bridal-lehenga.jpg", "/images/hero.jpg"],
    tags: ["bridal", "velvet", "lehenga", "wedding"],
    featured: true,
    sizes: SIZES,
    colors: ["Red"],
    stockPer: 2,
    desc: "Luxurious micro-velvet bridal lehenga with intricate resham and cut-dana embroidery, a 4-metre flare and a scalloped border. The set includes a fully embroidered blouse and two dupattas for the classic double-dupatta bridal look.",
  },
  {
    title: "Crimson Gota Patti Sangeet Lehenga",
    cat: "lehengas",
    store: "rajwada",
    price: 9499,
    mrp: 15999,
    images: ["/images/bridal-lehenga.jpg"],
    tags: ["sangeet", "gota patti", "lehenga", "festive"],
    sizes: SIZES,
    stockPer: 6,
    desc: "Lightweight georgette lehenga with traditional Rajasthani gota patti work – perfect for sangeet and mehendi nights when you need to dance all evening. Semi-stitched blouse and organza dupatta included.",
  },
  {
    title: "Peach Sequin Reception Gown with Cape",
    cat: "gowns",
    store: "rajwada",
    price: 14999,
    mrp: 22999,
    images: ["/images/gown.jpg", "/images/hero.jpg"],
    tags: ["reception", "gown", "indo-western", "sequin"],
    featured: true,
    sizes: SIZES,
    colors: ["Peach", "Champagne"],
    stockPer: 3,
    desc: "A dreamy pastel peach gown with all-over tonal sequin embroidery and a detachable sheer cape. Fully lined with a built-in corset for a flattering silhouette. Ideal for receptions and cocktail evenings.",
  },
  {
    title: "Blush Embellished Cocktail Gown",
    cat: "gowns",
    store: "rajwada",
    price: 8999,
    mrp: 13999,
    images: ["/images/gown.jpg"],
    tags: ["cocktail", "gown", "party"],
    sizes: SIZES,
    stockPer: 5,
    desc: "Flowy blush georgette gown with hand-embellished bodice and cascading ruffles. Concealed side zip, padded bust, and a sweeping floor-length hem.",
  },
  {
    title: "Kundan Bridal Jewellery Set – Necklace, Earrings & Maang Tikka",
    cat: "jewellery",
    store: "rajwada",
    price: 3499,
    mrp: 6999,
    images: ["/images/dupatta-jewellery.jpg"],
    tags: ["kundan", "jewellery", "bridal", "set"],
    featured: true,
    stock: 25,
    desc: "Traditional kundan and pearl bridal set with a statement choker necklace, matching chandbali earrings and maang tikka. High-quality gold plating over brass, hypoallergenic and skin-safe.",
  },
  {
    title: "Magenta Pure Banarasi Silk Saree",
    cat: "sarees",
    store: "banarasi",
    price: 7999,
    mrp: 12999,
    images: ["/images/banarasi-saree.jpg", "/images/hero.jpg"],
    tags: ["banarasi", "silk", "saree", "wedding", "handloom"],
    featured: true,
    stock: 18,
    desc: "Handwoven pure Katan silk Banarasi saree from Varanasi with traditional jangla jaal in real zari. Comes with a contrast brocade blouse piece and Silk Mark certification.\n\nLength: 5.5 m + 0.8 m blouse. Dry clean only.",
  },
  {
    title: "Katan Silk Banarasi Saree – Rani Pink with Gold Border",
    cat: "sarees",
    store: "banarasi",
    price: 10499,
    mrp: 16999,
    images: ["/images/banarasi-saree.jpg"],
    tags: ["banarasi", "katan", "saree", "bridal"],
    stock: 12,
    desc: "Classic rani pink Katan silk saree with heavy kadhwa buti work and an ornate gold zari border and pallu. Woven on handloom over 3 weeks by master weavers.",
  },
  {
    title: "Handwoven Kadhwa Banarasi Saree – Wine",
    cat: "sarees",
    store: "banarasi",
    price: 12999,
    mrp: 19999,
    images: ["/images/banarasi-saree.jpg"],
    tags: ["banarasi", "kadhwa", "saree", "heirloom"],
    stock: 8,
    desc: "An heirloom-quality kadhwa Banarasi saree in deep wine with meenakari floral motifs woven individually by hand. Silk Mark certified, with matching blouse fabric.",
  },
  {
    title: "Red Bridal Net Dupatta with Gota Border",
    cat: "dupattas",
    store: "banarasi",
    price: 1899,
    mrp: 3499,
    images: ["/images/dupatta-jewellery.jpg"],
    tags: ["dupatta", "bridal", "gota", "red"],
    stock: 40,
    desc: "Soft net bridal dupatta with a gold gota patti border, scattered sequin butis and tassel detailing – the perfect finishing touch for any bridal lehenga. Size: 2.5 m x 1 m.",
  },
  {
    title: "Ivory Gold Embroidered Wedding Sherwani",
    cat: "sherwanis",
    store: "nawabi",
    price: 18999,
    mrp: 29999,
    images: ["/images/sherwani.jpg", "/images/hero.jpg"],
    tags: ["sherwani", "groom", "wedding", "ivory"],
    featured: true,
    sizes: ["38", "40", "42", "44", "46"],
    colors: ["Ivory", "Gold"],
    stockPer: 3,
    desc: "Lucknowi groom sherwani in ivory raw silk with intricate gold thread embroidery on the collar, placket and cuffs. Includes churidar and a contrast maroon silk stole. Tailored fit with side slits and inner lining.",
  },
  {
    title: "Classic Ivory Silk Sherwani with Stole",
    cat: "sherwanis",
    store: "nawabi",
    price: 12499,
    mrp: 18999,
    images: ["/images/sherwani.jpg"],
    tags: ["sherwani", "silk", "reception"],
    sizes: ["38", "40", "42", "44"],
    stockPer: 4,
    desc: "Understated art-silk sherwani with subtle self-embroidery, paired with a churidar and printed stole. A versatile choice for receptions, engagements and family weddings.",
  },
  {
    title: "Mint Silk Kurta Pajama with Embroidered Nehru Jacket",
    cat: "kurta-sets",
    store: "nawabi",
    price: 4999,
    mrp: 7999,
    images: ["/images/kurta-set.jpg"],
    tags: ["kurta", "nehru jacket", "festive", "men"],
    featured: true,
    sizes: ["38", "40", "42", "44", "46"],
    colors: ["Mint", "Ivory"],
    stockPer: 6,
    desc: "Three-piece festive set: mint chanderi silk kurta, matching pajama and a navy embroidered Nehru jacket. Breathable, lightweight and perfect for haldi, mehendi or Diwali.",
  },
  {
    title: "Pastel Festive Kurta Set for Men",
    cat: "kurta-sets",
    store: "nawabi",
    price: 2499,
    mrp: 3999,
    images: ["/images/kurta-set.jpg"],
    tags: ["kurta", "cotton silk", "men", "festive"],
    sizes: ["38", "40", "42", "44"],
    stockPer: 10,
    desc: "Comfortable cotton-silk kurta with a mandarin collar and matching pajama. Machine washable, wrinkle resistant and available in classic pastel shades.",
  },
  {
    title: "Navy Embroidered Nehru Jacket",
    cat: "nehru-jackets",
    store: "nawabi",
    price: 2999,
    mrp: 4499,
    images: ["/images/kurta-set.jpg"],
    tags: ["nehru jacket", "waistcoat", "men"],
    sizes: ["38", "40", "42", "44", "46"],
    stockPer: 8,
    desc: "Structured navy Nehru jacket with delicate gold thread embroidery and a satin lining. Layers over any kurta or shirt for an instant festive upgrade.",
  },
  {
    title: "Indo-Western Bandhgala Set with Draped Stole",
    cat: "indo-western",
    store: "nawabi",
    price: 9999,
    mrp: 15999,
    images: ["/images/sherwani.jpg"],
    tags: ["bandhgala", "indo-western", "groom", "cocktail"],
    sizes: ["38", "40", "42", "44"],
    stockPer: 3,
    desc: "Contemporary bandhgala with asymmetric draped stole, textured jacquard fabric and slim trousers. Designed for the modern groom's cocktail or sangeet night.",
  },
  {
    title: "Teal Gota Patti Floor-Length Anarkali Suit",
    cat: "anarkali-suits",
    store: "surat",
    price: 5499,
    mrp: 8999,
    images: ["/images/anarkali.jpg"],
    tags: ["anarkali", "gota patti", "festive", "teal"],
    featured: true,
    sizes: ["XS", ...SIZES],
    colors: ["Teal", "Emerald"],
    stockPer: 5,
    desc: "Floor-length georgette anarkali with gold gota patti work, a fitted bodice and a 6-metre flare. Comes with churidar and matching net dupatta. Fully stitched – ready to wear.",
  },
  {
    title: "Emerald Anarkali Suit with Embroidered Net Dupatta",
    cat: "anarkali-suits",
    store: "surat",
    price: 6999,
    mrp: 10999,
    images: ["/images/anarkali.jpg", "/images/hero.jpg"],
    tags: ["anarkali", "emerald", "wedding guest"],
    sizes: SIZES,
    stockPer: 4,
    desc: "Rich emerald green anarkali in soft silk with sequin and zari embroidery on the yoke and hem. Paired with a heavily embroidered net dupatta – a wedding-guest favourite.",
  },
  {
    title: "Pink & Gold Festive Lehenga Choli for Girls",
    cat: "girls-ethnic",
    store: "surat",
    price: 1999,
    mrp: 3499,
    images: ["/images/kids-lehenga.jpg"],
    tags: ["kids", "girls", "lehenga", "festive"],
    featured: true,
    sizes: KIDS,
    stockPer: 8,
    desc: "Adorable pink lehenga choli with gold foil print, sequin embroidery and a soft net dupatta. Elasticated waist, cotton lining and easy back closure so kids stay comfortable all day.",
  },
  {
    title: "Royal Blue Brocade Jacket Kurta Set for Boys",
    cat: "boys-ethnic",
    store: "surat",
    price: 1799,
    mrp: 2999,
    images: ["/images/kids-sherwani.jpg"],
    tags: ["kids", "boys", "kurta", "jacket", "wedding"],
    sizes: KIDS,
    stockPer: 8,
    desc: "Three-piece set for little gentlemen – royal blue silk kurta, gold brocade jacket and dhoti-style pants with an elastic waistband. Soft cotton lining throughout.",
  },
];

/* --------------------------------- seed --------------------------------- */

export async function seedIfEmpty() {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(categories);
  if (n > 0) return false;
  await seed();
  return true;
}

export async function resetAndSeed() {
  await db.execute(sql`TRUNCATE TABLE notifications, reviews, order_items, orders, cart, wishlist, product_variants, products, coupons, stores, categories, users RESTART IDENTITY CASCADE`);
  await seed();
}

export async function seed() {
  /* categories */
  const parents = [
    { name: "Women's Ethnic", slug: "women", sortOrder: 1 },
    { name: "Men's Ethnic", slug: "men", sortOrder: 2 },
    { name: "Kids", slug: "kids", sortOrder: 3 },
    { name: "Accessories", slug: "accessories", sortOrder: 4 },
  ];
  const parentRows = await db.insert(categories).values(parents).returning();
  const parentId = (slug: string) => parentRows.find((p) => p.slug === slug)!.id;

  const children = [
    ["Lehengas", "lehengas", "women", 1],
    ["Sarees", "sarees", "women", 2],
    ["Anarkali Suits", "anarkali-suits", "women", 3],
    ["Salwar Kameez", "salwar-kameez", "women", 4],
    ["Gowns", "gowns", "women", 5],
    ["Sherwanis", "sherwanis", "men", 1],
    ["Kurta Sets", "kurta-sets", "men", 2],
    ["Nehru Jackets", "nehru-jackets", "men", 3],
    ["Indo-Western", "indo-western", "men", 4],
    ["Girls Ethnic", "girls-ethnic", "kids", 1],
    ["Boys Ethnic", "boys-ethnic", "kids", 2],
    ["Dupattas", "dupattas", "accessories", 1],
    ["Jewellery", "jewellery", "accessories", 2],
    ["Juttis & Mojaris", "footwear", "accessories", 3],
  ] as const;
  const childRows = await db
    .insert(categories)
    .values(children.map(([name, slug, parent, sortOrder]) => ({ name, slug, parentId: parentId(parent), sortOrder })))
    .returning();
  const catId = (slug: string) => childRows.find((c) => c.slug === slug)!.id;

  /* users */
  const mkUser = (email: string, fullName: string, role: string, password: string, phone?: string) => ({
    clerkId: `local_${slugify(email)}`,
    email,
    fullName,
    role,
    phone: phone ?? null,
    passwordHash: hashPassword(password),
  });
  const userRows = await db
    .insert(users)
    .values([
      mkUser("admin@aalmvastralay.com", "Aalm Admin", "admin", "Admin@123", "9876500000"),
      mkUser("rajwada@seller.com", "Meenakshi Rathore", "seller", "Seller@123", "9876511111"),
      mkUser("banarasi@seller.com", "Ramesh Maurya", "seller", "Seller@123", "9876522222"),
      mkUser("nawabi@seller.com", "Imran Siddiqui", "seller", "Seller@123", "9876533333"),
      mkUser("surat@seller.com", "Hetal Patel", "seller", "Seller@123", "9876544444"),
      mkUser("priya@example.com", "Priya Sharma", "customer", "Priya@123", "9898989898"),
      mkUser("rahul@example.com", "Rahul Verma", "customer", "Rahul@123"),
      mkUser("anjali@example.com", "Anjali Nair", "customer", "Anjali@123"),
      mkUser("meera@example.com", "Meera Iyer", "customer", "Meera@123"),
    ])
    .returning();
  const uid = (email: string) => userRows.find((u) => u.email === email)!.id;

  /* stores */
  const storeRows = await db
    .insert(stores)
    .values([
      {
        ownerId: uid("rajwada@seller.com"),
        storeName: "Rajwada Couture",
        slug: "rajwada-couture",
        description: "Bridal lehengas and couture gowns handcrafted in Jaipur since 1998. Every piece is embroidered in-house by 40+ karigars.",
        bannerUrl: "/images/hero.jpg",
        address: "12, Johari Bazaar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302003",
        gstNumber: "08AAACR1234A1Z5",
      },
      {
        ownerId: uid("banarasi@seller.com"),
        storeName: "Banarasi Silk House",
        slug: "banarasi-silk-house",
        description: "Third-generation handloom weavers from Varanasi. Silk Mark certified pure Katan and Georgette Banarasi sarees.",
        bannerUrl: "/images/banarasi-saree.jpg",
        address: "Thatheri Bazaar, Chowk",
        city: "Varanasi",
        state: "Uttar Pradesh",
        pincode: "221001",
        gstNumber: "09AABCB5678B1Z3",
      },
      {
        ownerId: uid("nawabi@seller.com"),
        storeName: "Nawabi Threads",
        slug: "nawabi-threads",
        description: "Lucknow's menswear atelier – sherwanis, bandhgalas and chikankari kurtas with a modern fit.",
        bannerUrl: "/images/sherwani.jpg",
        address: "Hazratganj",
        city: "Lucknow",
        state: "Uttar Pradesh",
        pincode: "226001",
        gstNumber: "09AACCN9012C1Z1",
      },
      {
        ownerId: uid("surat@seller.com"),
        storeName: "Surat Fashion Hub",
        slug: "surat-fashion-hub",
        description: "Ready-to-wear anarkalis, kidswear and festive sets at factory prices, straight from Surat's textile hub.",
        bannerUrl: "/images/anarkali.jpg",
        address: "Ring Road, Textile Market",
        city: "Surat",
        state: "Gujarat",
        pincode: "395002",
        gstNumber: "24AADCS3456D1Z9",
      },
    ])
    .returning();
  const storeKey: Record<string, string> = {
    rajwada: storeRows[0].id,
    banarasi: storeRows[1].id,
    nawabi: storeRows[2].id,
    surat: storeRows[3].id,
  };

  /* products + variants */
  const productIds: Record<string, string> = {};
  let skuCounter = 1000;
  for (const p of PRODUCTS) {
    const variantDefs: { size: string | null; color: string | null }[] = [];
    if (p.sizes && p.colors) for (const s of p.sizes) for (const c of p.colors) variantDefs.push({ size: s, color: c });
    else if (p.sizes) for (const s of p.sizes) variantDefs.push({ size: s, color: null });
    else if (p.colors) for (const c of p.colors) variantDefs.push({ size: null, color: c });
    const per = p.stockPer ?? 5;
    const totalStock = variantDefs.length ? variantDefs.length * per : (p.stock ?? 10);

    const [row] = await db
      .insert(products)
      .values({
        storeId: storeKey[p.store],
        categoryId: catId(p.cat),
        title: p.title,
        slug: slugify(p.title),
        description: p.desc,
        price: p.price,
        mrp: p.mrp,
        stock: totalStock,
        shippingWeightGrams: WEIGHTS[p.cat] ?? 800,
        sku: `AV-${++skuCounter}`,
        images: p.images,
        videoUrl: p.video ?? null,
        tags: p.tags,
        isFeatured: p.featured ?? false,
      })
      .returning({ id: products.id });
    productIds[p.title] = row.id;

    if (variantDefs.length) {
      await db.insert(productVariants).values(
        variantDefs.map((v, i) => ({
          productId: row.id,
          size: v.size,
          color: v.color,
          stock: per,
          priceAdjustment: v.size === "XXL" || v.size === "46" ? 500 : 0,
          sku: `AV-${skuCounter}-${i + 1}`,
        })),
      );
    }
  }

  /* reviews */
  const reviewData: [string, string, number, string, string][] = [
    ["Scarlet Zardozi Bridal Lehenga Set", "priya@example.com", 5, "Dream bridal outfit!", "Wore this for my wedding in Udaipur and received compliments all night. The zardozi work is even more beautiful in person and the fit was perfect after the custom blouse stitching."],
    ["Scarlet Zardozi Bridal Lehenga Set", "anjali@example.com", 5, "Worth every rupee", "Heavy, luxurious and the colour is a true bridal red. Delivered in 6 days with careful packaging."],
    ["Scarlet Zardozi Bridal Lehenga Set", "meera@example.com", 4, "Gorgeous but heavy", "Absolutely stunning lehenga. Just be prepared – it is heavy, as bridal lehengas are."],
    ["Magenta Pure Banarasi Silk Saree", "rahul@example.com", 5, "Bought for my mother", "Authentic Banarasi with Silk Mark tag. Mom loved the zari work and the blouse piece matched perfectly."],
    ["Magenta Pure Banarasi Silk Saree", "priya@example.com", 4, "Beautiful drape", "The silk is soft and drapes beautifully. Colour is slightly brighter than the photos."],
    ["Ivory Gold Embroidered Wedding Sherwani", "rahul@example.com", 5, "Groom approved", "Got married in this sherwani. The embroidery is neat and the fit (42) was true to size. The stole is a lovely touch."],
    ["Mint Silk Kurta Pajama with Embroidered Nehru Jacket", "priya@example.com", 5, "Perfect haldi outfit for my husband", "Lovely pastel shade, breathable fabric and the jacket elevates the whole look. Great value."],
    ["Mint Silk Kurta Pajama with Embroidered Nehru Jacket", "meera@example.com", 4, "Nice set", "Good quality for the price. Kurta slightly long but that is fixable."],
    ["Teal Gota Patti Floor-Length Anarkali Suit", "anjali@example.com", 5, "Stunning flare", "The flare on this anarkali is huge – twirl-worthy! Fully stitched and ready to wear."],
    ["Pink & Gold Festive Lehenga Choli for Girls", "meera@example.com", 5, "My daughter loves it", "Comfortable lining, pretty colour and easy to wear. Size 6-7Y fit my 6-year-old perfectly."],
    ["Kundan Bridal Jewellery Set – Necklace, Earrings & Maang Tikka", "anjali@example.com", 4, "Looks premium", "Looks far more expensive than it is. Earrings are a little heavy for long wear."],
    ["Peach Sequin Reception Gown with Cape", "priya@example.com", 5, "Reception showstopper", "The cape makes this gown! Sequins are sewn securely and the corset gives great shape."],
    ["Red Bridal Net Dupatta with Gota Border", "meera@example.com", 5, "Exactly as pictured", "Perfect finishing piece for my sister's bridal look. Gota border is neat."],
  ];
  await db.insert(reviews).values(
    reviewData.map(([title, email, rating, rtitle, body]) => ({
      productId: productIds[title],
      userId: uid(email),
      rating,
      title: rtitle,
      body,
      isVerified: true,
    })),
  );
  await db.execute(sql`
    UPDATE products p SET
      rating = r.avg_rating,
      total_reviews = r.cnt
    FROM (SELECT product_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS cnt FROM reviews GROUP BY product_id) r
    WHERE r.product_id = p.id`);
  await db.execute(sql`
    UPDATE stores s SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM products WHERE store_id = s.id AND total_reviews > 0), 0)`);

  /* coupons */
  const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  await db.insert(coupons).values([
    { code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrderValue: 999, maxDiscount: 500, validFrom: new Date(), validUntil: in90Days },
    { code: "WEDDING500", discountType: "fixed", discountValue: 500, minOrderValue: 4999, validFrom: new Date(), validUntil: in90Days },
    { code: "FESTIVE15", discountType: "percentage", discountValue: 15, minOrderValue: 2999, maxDiscount: 1500, usageLimit: 100, validFrom: new Date(), validUntil: in90Days },
  ]);

  /* sample orders for the demo customer */
  const priya = uid("priya@example.com");
  const address = {
    fullName: "Priya Sharma",
    phone: "9898989898",
    addressLine: "B-204, Shanti Residency, Sector 21",
    landmark: "Near City Mall",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122016",
  };
  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  const lehengaVariant = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(sql`${productVariants.productId} = ${productIds["Scarlet Zardozi Bridal Lehenga Set"]} AND size = 'M' AND color = 'Red'`)
    .limit(1);
  const kurtaVariant = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(sql`${productVariants.productId} = ${productIds["Mint Silk Kurta Pajama with Embroidered Nehru Jacket"]} AND size = '42' AND color = 'Mint'`)
    .limit(1);

  const sampleOrders = [
    {
      orderNumber: "AV-DEMO-0001",
      storeId: storeKey.rajwada,
      status: "delivered",
      paymentMethod: "cod",
      paymentStatus: "paid",
      subtotal: 24999,
      shippingFee: 0,
      total: 24999,
      createdAt: daysAgo(14),
      updatedAt: daysAgo(9),
      trackingNumber: "DLV123456789IN",
      courier: "Delhivery",
      items: [{ productId: productIds["Scarlet Zardozi Bridal Lehenga Set"], variantId: lehengaVariant[0]?.id ?? null, quantity: 1, price: 24999 }],
    },
    {
      orderNumber: "AV-DEMO-0002",
      storeId: storeKey.nawabi,
      status: "shipped",
      paymentMethod: "upi",
      paymentStatus: "paid",
      subtotal: 7998,
      shippingFee: 0,
      total: 7998,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
      trackingNumber: "BLUE98765432",
      courier: "Bluedart",
      items: [
        { productId: productIds["Mint Silk Kurta Pajama with Embroidered Nehru Jacket"], variantId: kurtaVariant[0]?.id ?? null, quantity: 1, price: 4999 },
        { productId: productIds["Navy Embroidered Nehru Jacket"], variantId: null, quantity: 1, price: 2999 },
      ],
    },
    {
      orderNumber: "AV-DEMO-0003",
      storeId: storeKey.rajwada,
      status: "pending",
      paymentMethod: "online",
      paymentStatus: "paid",
      subtotal: 3499,
      shippingFee: 0,
      total: 3499,
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
      trackingNumber: null,
      courier: null,
      items: [{ productId: productIds["Kundan Bridal Jewellery Set – Necklace, Earrings & Maang Tikka"], variantId: null, quantity: 1, price: 3499 }],
    },
  ];

  for (const o of sampleOrders) {
    const { items, ...orderValues } = o;
    const [row] = await db
      .insert(orders)
      .values({ ...orderValues, customerId: priya, shippingAddress: address })
      .returning({ id: orders.id });
    await db.insert(orderItems).values(items.map((it) => ({ orderId: row.id, ...it, total: it.price * it.quantity })));
  }
  await db.update(stores).set({ totalSales: 2 }).where(sql`${stores.id} = ${storeKey.rajwada}`);
  await db.update(stores).set({ totalSales: 1 }).where(sql`${stores.id} = ${storeKey.nawabi}`);

  /* settings – fresh installs land on the modern defaults */
  const { SETTINGS_FIELDS } = await import("../lib/settings-defs");
  for (const f of SETTINGS_FIELDS) {
    await db.insert(settings).values({ key: f.key, value: f.default, group: f.group, label: f.label }).onConflictDoNothing();
  }
  await db.execute(sql`UPDATE settings SET value = 'system' WHERE key = 'theme.defaultMode' AND value = 'light'`);
  await db.execute(sql`UPDATE settings SET value = 'true' WHERE key = 'theme.allowUserToggle'`);
  await db.execute(sql`UPDATE settings SET value = '8' WHERE key = 'security.formRateLimit'`);

  await db.insert(notifications).values([
    { userId: priya, type: "order_delivered", title: "Order AV-DEMO-0001 delivered", body: "Your bridal lehenga has been delivered. Enjoy your purchase!", isRead: true, createdAt: daysAgo(9) },
    { userId: priya, type: "order_shipped", title: "Order AV-DEMO-0002 shipped", body: "Shipped via Bluedart (Tracking: BLUE98765432).", createdAt: daysAgo(1) },
    { userId: priya, type: "order_placed", title: "Order placed successfully", body: "AV-DEMO-0003 · Total ₹3499", createdAt: daysAgo(0) },
    { userId: uid("rajwada@seller.com"), type: "new_order", title: "New order AV-DEMO-0003", body: "1 item · ₹3499 · ONLINE", createdAt: daysAgo(0) },
  ]);
}

/* CLI: `npx tsx src/db/seed.ts` or `npx tsx src/db/seed.ts --reset` */
if (process.argv[1] && /seed\.(ts|js|mjs)$/.test(process.argv[1])) {
  const reset = process.argv.includes("--reset");
  (reset ? resetAndSeed().then(() => true) : seedIfEmpty())
    .then(async (did) => {
      console.log(did ? "✔ Database seeded with demo data." : "• Database already has data – skipped (use --reset to reseed).");
      await pool.end();
    })
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
