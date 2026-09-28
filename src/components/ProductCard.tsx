import type React from "react";
import Link from "next/link";
import { Truck, Flame } from "lucide-react";
import type { Product } from "@/db/schema";
import { firstImage } from "@/lib/media-resolver";
import { formatINR, freeShippingThreshold } from "@/lib/utils";
import { RatingPill } from "./Rating";

export type ProductCardData = Pick<
  Product,
  | "id"
  | "title"
  | "slug"
  | "price"
  | "mrp"
  | "discountPercent"
  | "images"
  | "rating"
  | "totalReviews"
  | "stock"
> & {
  storeName?: string | null;
  storeSlug?: string | null;
};

export default function ProductCard({
  product,
  priority = false,
  watermark,
}: {
  product: ProductCardData;
  priority?: boolean;
  watermark?: React.ReactNode;
}) {
  const discount = Math.round(Number(product.discountPercent ?? 0));
  const mrp = product.mrp ?? product.price;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock > 0 && product.stock <= 3;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-[0_16px_36px_-12px_rgba(122,31,43,0.18)] dark:hover:shadow-[0_16px_36px_-12px_rgba(212,175,55,0.22)] active:scale-[0.98]"
      aria-label={`${product.title} - ${formatINR(product.price)}`}
    >
      <div className="relative aspect-[3/4] w-full max-w-full overflow-hidden bg-cream-100 dark:bg-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={firstImage(product.images, { width: 600, thumbnail: false })}
          alt={product.title}
          width={600}
          height={800}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Discount Badge with Shimmer */}
        {discount > 0 && !outOfStock && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs ${
              discount >= 35
                ? "bg-gradient-to-r from-amber-600 via-rose-600 to-maroon-700 animate-shimmer"
                : "bg-maroon-700"
            }`}
          >
            {discount >= 35 ? `🔥 महाबचत ${discount}% OFF` : `${discount}% OFF`}
          </span>
        )}

        {/* Urgency Stock / Out of Stock Badges */}
        {outOfStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-slate-900/85 py-1.5 text-center text-xs font-semibold text-white backdrop-blur-xs">
            Out of stock
          </span>
        ) : lowStock ? (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-amber-500/95 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
            <Flame className="h-3 w-3 fill-current animate-pulse" /> केवल {product.stock} शेष!
          </span>
        ) : null}

        {watermark}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5">
        <div className="space-y-1">
          {product.storeName && (
            <p className="truncate text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-gold-400">
              {product.storeName}
            </p>
          )}

          <h3 className="line-clamp-2 min-h-[2.6em] text-xs sm:text-sm font-semibold capitalize leading-snug text-[color:var(--text)] transition-colors duration-200 group-hover:text-[color:var(--brand)]">
            {product.title}
          </h3>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-1.5 sm:gap-2 pt-1">
          <span className="text-sm sm:text-base font-bold text-maroon-800 dark:text-rose-300">
            {formatINR(product.price)}
          </span>
          {mrp > product.price && (
            <>
              <span className="text-[11px] sm:text-xs text-[color:var(--text-soft)] line-through">
                {formatINR(mrp)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                (बचत {formatINR(mrp - product.price)})
              </span>
            </>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 border-t border-[color:var(--border)]/50 pt-2 pb-0.5 text-xs">
          <RatingPill value={product.rating} count={product.totalReviews} />
          {product.price >= freeShippingThreshold() && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <Truck className="h-3 w-3" /> Free Delivery
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
