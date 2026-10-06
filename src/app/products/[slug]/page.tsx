import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { BadgeCheck, MapPin, RotateCcw, ShieldCheck, Truck, Wallet } from "lucide-react";
import { db } from "@/db";
import { categories, productVariants, products, reviews, reviewVotes, stores, users, wishlist } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { resolveImage, resolveVideo } from "@/lib/media-resolver";
import { formatDate, formatINR, freeShippingThreshold } from "@/lib/utils";
import { formatWeight } from "@/lib/format";
import { getCommerce, getSettingBool } from "@/lib/settings";
import ImageGallery from "@/components/product/ImageGallery";
import PurchasePanel from "@/components/product/PurchasePanel";
import ReviewForm from "@/components/product/ReviewForm";
import Reveal from "@/components/ui/Reveal";
import Watermark from "@/components/Watermark";
import ProductCard from "@/components/ProductCard";
import { Rating, RatingPill } from "@/components/Rating";
import SizeGuideModal from "@/components/product/SizeGuideModal";
import PincodeEstimator from "@/components/product/PincodeEstimator";
import WhatsAppShare from "@/components/product/WhatsAppShare";
import WhatsAppConsultButton from "@/components/product/WhatsAppConsultButton";
import MobileStickyBar from "@/components/product/MobileStickyBar";
import PersonalizedRecommendations from "@/components/home/PersonalizedRecommendations";
import UserAvatar from "@/components/UserAvatar";
import { formatReviewerName } from "@/lib/masking";
import ReviewPhotoGallery from "@/components/product/ReviewPhotoGallery";
import ReviewHelpfulButton from "@/components/product/ReviewHelpfulButton";

export const revalidate = 60;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];
const sizeRank = (s: string | null) => {
  if (!s) return 999;
  const i = SIZE_ORDER.indexOf(s);
  if (i >= 0) return i;
  const n = parseFloat(s);
  return Number.isNaN(n) ? 500 : 100 + n;
};

async function loadProduct(slug: string) {
  const [row] = await db
    .select({ product: products, store: stores, category: categories })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const row = await loadProduct(slug);
  if (!row) return { title: "Product not found" };
  return {
    title: `${row.product.title} – ${formatINR(row.product.price)}`,
    description: row.product.description?.slice(0, 160),
    openGraph: { images: [resolveImage(row.product.images[0])] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await loadProduct(slug);
  const user = await getCurrentUser();
  if (!row) notFound();
  const { product, store, category } = row;
  const isOwner = user && (user.id === store.ownerId || user.role === "admin");
  if ((!product.isActive || !store.isActive) && !isOwner) notFound();

  const [commerce, reviewsEnabled, [variants, reviewRows, similar, wish, parentCat]] = await Promise.all([
    getCommerce(),
    getSettingBool("features.reviews", true),
    Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
    db
      .select({ review: reviews, userName: users.fullName, userRole: users.role })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt))
      .limit(30),
    product.categoryId
      ? db
          .select({ product: products, storeName: stores.storeName })
          .from(products)
          .innerJoin(stores, eq(products.storeId, stores.id))
          .where(and(eq(products.categoryId, product.categoryId), ne(products.id, product.id), eq(products.isActive, true), eq(stores.isActive, true)))
          .orderBy(desc(products.rating))
          .limit(4)
      : Promise.resolve([]),
    user
      ? db
          .select({ id: wishlist.id })
          .from(wishlist)
          .where(and(eq(wishlist.userId, user.id), eq(wishlist.productId, product.id)))
          .limit(1)
      : Promise.resolve([]),
      category?.parentId ? db.select().from(categories).where(eq(categories.id, category.parentId)).limit(1) : Promise.resolve([]),
    ]),
  ]);

  variants.sort((a, b) => sizeRank(a.size) - sizeRank(b.size) || (a.color ?? "").localeCompare(b.color ?? ""));
  const images = (product.images.length ? product.images : [null]).map((src) => resolveImage(src, { width: 900 }));
  const video = resolveVideo(product.videoUrl);
  const discount = Math.round(Number(product.discountPercent ?? 0));
  const mrp = product.mrp ?? product.price;
  const alreadyReviewed = user ? reviewRows.some((r) => r.review.userId === user.id) : false;
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviewRows.filter((r) => r.review.rating === star).length }));
  const effectiveTotalReviews = reviewRows.length > 0 ? reviewRows.length : Number(product.totalReviews ?? 0);
  const effectiveRating = reviewRows.length > 0
    ? Number((reviewRows.reduce((acc, r) => acc + (r.review.rating || 0), 0) / reviewRows.length).toFixed(1))
    : Number(product.rating ?? 0);

  const userVotedReviewIds = new Set<string>();
  if (user && reviewRows.length > 0) {
    const reviewIds = reviewRows.map((r) => r.review.id).filter(Boolean);
    try {
      const votes = await db
        .select({ reviewId: reviewVotes.reviewId })
        .from(reviewVotes)
        .where(and(eq(reviewVotes.userId, user.id), inArray(reviewVotes.reviewId, reviewIds)));
      for (const v of votes) {
        userVotedReviewIds.add(v.reviewId);
      }
    } catch {
      // Non-fatal if table not yet populated
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aalmvastralay.com";
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: product.images.map((img) => resolveImage(img)),
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: store.storeName || "Aalm Vastralay",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: store.storeName || "Aalm Vastralay",
      },
    },
    ...(effectiveRating > 0 && effectiveTotalReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: effectiveRating,
            reviewCount: effectiveTotalReviews,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: category.name,
              item: `${siteUrl}/products?category=${category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product.title,
              item: `${siteUrl}/products/${product.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: product.title,
              item: `${siteUrl}/products/${product.slug}`,
            },
          ]),
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-maroon-700">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        {parentCat[0] && (
          <>
            <Link href={`/products?category=${parentCat[0].slug}`} className="hover:text-maroon-700">
              {parentCat[0].name}
            </Link>
            <span className="mx-1.5">/</span>
          </>
        )}
        {category && (
          <>
            <Link href={`/products?category=${category.slug}`} className="hover:text-maroon-700">
              {category.name}
            </Link>
            <span className="mx-1.5">/</span>
          </>
        )}
        <span className="text-slate-900 dark:text-stone-100 font-medium">{product.title}</span>
      </nav>

      {!product.isActive && <p className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-4 py-2 text-sm text-amber-800 dark:text-amber-300">This product is currently hidden from customers (inactive). Only you can see this preview.</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-2 shadow-xs dark:shadow-stone-950/60">
          <ImageGallery images={images} title={product.title} video={video} />
          <Watermark variant="gallery" />
        </div>

        <div>
          <Link href={`/stores/${store.slug}`} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-maroon-700 dark:text-gold-400 hover:text-maroon-900 dark:hover:text-gold-300 hover:underline">
            {store.storeName} <BadgeCheck className="h-3.5 w-3.5" />
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold leading-snug text-slate-900 dark:text-stone-50 md:text-3xl">{product.title}</h1>
          <div className="mt-2">
            <RatingPill value={product.rating} count={product.totalReviews} />
          </div>

          <div id="purchase-panel" className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300">Select Size & Variant</span>
              <SizeGuideModal categoryName={category?.name} />
            </div>
            <PurchasePanel
              productId={product.id}
              price={product.price}
              mrp={mrp}
              stock={product.stock}
              variants={variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock, priceAdjustment: v.priceAdjustment }))}
              initialWishlisted={wish.length > 0}
              freeShippingAbove={freeShippingThreshold()}
            />
          </div>

          <div className="mt-4 space-y-3">
            <WhatsAppShare
              title={product.title}
              price={product.price}
              slug={product.slug}
              storeName={store.storeName}
            />
            <WhatsAppConsultButton
              productTitle={product.title}
              productSlug={product.slug}
            />
            <PincodeEstimator />
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            {[
              [Wallet, "Cash on Delivery"],
              [RotateCcw, "7-day easy returns"],
              [Truck, "Ships in 2–4 days"],
              [ShieldCheck, "Verified seller"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Wallet;
              return (
                <li key={label as string} className="flex flex-col items-center gap-1.5 rounded-xl border border-cream-200 dark:border-stone-700 bg-white dark:bg-stone-800/90 p-3 text-center shadow-xs transition-colors">
                  <I className="h-5 w-5 text-maroon-700 dark:text-gold-400" />
                  <span className="font-medium text-slate-800 dark:text-stone-200">{label as string}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-maroon-900 dark:text-stone-100">Product details</h2>
            <div className="prose-desc mt-2 text-sm leading-relaxed text-slate-700 dark:text-stone-300">
              {(product.description ?? "No description provided.").split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {product.sku && (
                <>
                  <dt className="text-slate-600 dark:text-stone-400">SKU</dt>
                  <dd className="font-semibold text-slate-900 dark:text-stone-100">{product.sku}</dd>
                </>
              )}
              {category && (
                <>
                  <dt className="text-slate-600 dark:text-stone-400">Category</dt>
                  <dd className="font-semibold text-slate-900 dark:text-stone-100">{category.name}</dd>
                </>
              )}
              {commerce.showWeight && product.shippingWeightGrams > 0 && (
                <>
                  <dt className="text-slate-600 dark:text-stone-400">Shipping weight</dt>
                  <dd className="font-semibold text-slate-900 dark:text-stone-100">{formatWeight(product.shippingWeightGrams)}</dd>
                </>
              )}
              <dt className="text-slate-600 dark:text-stone-400">Returns</dt>
              <dd className="font-semibold text-slate-900 dark:text-stone-100">{commerce.returnWindowDays}-day easy return window</dd>
              <dt className="text-slate-600 dark:text-stone-400">Sold by</dt>
              <dd className="font-semibold text-slate-900 dark:text-stone-100">
                {store.storeName}
                <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-slate-500 dark:text-stone-400">
                  <MapPin className="h-3 w-3" />
                  {store.city}
                </span>
              </dd>
            </dl>
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <Link key={t} href={`/products?q=${encodeURIComponent(t)}`} className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs text-maroon-800 hover:bg-cream-200">
                    #{t}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviewsEnabled && (
      <section className="mt-14 grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 className="section-title">Ratings &amp; Reviews</h2>
          <div className="card mt-4 p-5 dark:border-stone-850 dark:bg-stone-900/60">
            <div className="flex items-end gap-3">
              <span className="font-display text-5xl font-semibold text-maroon-900 dark:text-gold-300">{effectiveRating.toFixed(1)}</span>
              <div className="pb-1">
                <Rating value={effectiveRating} showValue={false} size="md" />
                <p className="text-xs text-slate-500 dark:text-stone-400">{effectiveTotalReviews} {effectiveTotalReviews === 1 ? "verified rating" : "verified ratings"}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5">
              {breakdown.map(({ star, n }) => (
                <li key={star} className="flex items-center gap-2 text-xs text-slate-700 dark:text-stone-300">
                  <span className="w-6">{star}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200 dark:bg-stone-800">
                    <span className="block h-full bg-gold-500" style={{ width: `${reviewRows.length ? (n / reviewRows.length) * 100 : 0}%` }} />
                  </span>
                  <span className="w-6 text-right text-slate-500 dark:text-stone-400">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            {user ? (
              alreadyReviewed ? (
                <p className="text-sm text-slate-500 dark:text-stone-400">You have already reviewed this product. Thank you!</p>
              ) : (
                <ReviewForm productId={product.id} />
              )
            ) : (
              <div className="card p-4 sm:p-5 border-dashed border-stone-200 dark:border-stone-800 text-center">
                <p className="text-sm text-slate-600 dark:text-stone-300">
                  Customer reviews &amp; ratings are public and visible to everyone.
                </p>
                <Link
                  href={`/sign-in?redirect_url=/products/${product.slug}`}
                  className="btn btn-outline btn-sm mt-2.5 inline-flex items-center gap-1.5 font-semibold text-maroon-700 dark:text-gold-400 hover:text-maroon-800"
                >
                  Sign in to write a review
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {reviewRows.length === 0 && <p className="card p-6 text-sm text-slate-500 dark:border-stone-850 dark:bg-stone-900/60 dark:text-stone-400">No reviews yet. Be the first to review this product.</p>}
          {reviewRows.map(({ review, userName, userRole }) => {
            const reviewerDisplayName = formatReviewerName(userName);
            return (
              <article key={review.id} className="card p-5 transition-shadow hover:shadow-md dark:border-stone-850 dark:bg-stone-900/60">
                {/* Header: Customer Avatar + Formatted Name + Verified Badge + Star Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      seed={review.userId || userName || review.id}
                      name={reviewerDisplayName}
                      size={40}
                      className="h-10 w-10 shrink-0 rounded-full border border-stone-200 dark:border-stone-700 object-cover shadow-2xs"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-stone-100 truncate">
                          {reviewerDisplayName}
                        </span>
                        {review.isVerified && (
                          <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 text-[11px] py-0.5 px-2 inline-flex items-center gap-1">
                            <BadgeCheck className="h-3 w-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-stone-400">
                        Reviewed on {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <Rating value={review.rating} showValue={false} size="sm" />
                  </div>
                </div>

                {/* Review Title & Body */}
                <div className="mt-3 space-y-1.5">
                  {review.title && (
                    <h4 className="font-semibold text-slate-900 dark:text-stone-100 text-sm">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-stone-300 whitespace-pre-line">
                    {review.body}
                  </p>
                </div>

                {/* Customer Photo Gallery with Fullscreen Lightbox Modal */}
                {review.images && review.images.length > 0 && (
                  <ReviewPhotoGallery images={review.images} />
                )}

                {/* Footer: Helpful Button */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between text-xs text-slate-500 dark:text-stone-400">
                  <span>Was this review helpful?</span>
                  <ReviewHelpfulButton
                    reviewId={review.id}
                    initialCount={review.helpfulCount ?? 0}
                    initialVoted={userVotedReviewIds.has(review.id)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      )}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-6">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {similar.map(({ product: p, storeName }) => (
              <ProductCard key={p.id} product={{ ...p, storeName }} />
            ))}
          </div>
        </section>
      )}

      {/* AI Personalized Recommendations based on this item and user views */}
      <PersonalizedRecommendations
        currentProductId={product.id}
        title="मिलते-जुलते अन्य विकल्प (You May Also Love)"
        subtitle="AI-curated recommendations based on your preferences and this collection"
        limit={4}
      />

      {/* Mobile Sticky Action Bar for quick purchase & WhatsApp consultation */}
      <MobileStickyBar
        title={product.title}
        price={product.price}
        mrp={product.mrp ?? undefined}
        slug={product.slug}
      />
    </div>
  );
}
