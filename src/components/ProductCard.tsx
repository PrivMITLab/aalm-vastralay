import type React from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Truck, Flame } from "lucide-react";
import type { Product } from "@/db/schema";
import { formatINR, freeShippingThreshold } from "@/lib/utils";
import { RatingPill } from "./Rating";
import { SmartImage } from "@/components/media/SmartImage";

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
  const coverImage = product.images?.[0] || "";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-[0_16px_36px_-12px_rgba(122,31,43,0.18)] dark:hover:shadow-[0_16px_36px_-12px_rgba(212,175,55,0.22)] active:scale-[0.98]"
      aria-label={`${product.title} - ${formatINR(product.price)}`}
    >
      <div className="relative aspect-[3/4] w-full max-w-full overflow-hidden bg-cream-100 dark:bg-stone-900">
        <SmartImage
          src={coverImage}
          alt={product.title}
          width={600}
          loading={priority ? "eager" : "lazy"}
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

        {/* ❤️ Wishlist Heart — 44px tap target, top-right overlay */}
        {!outOfStock && (
          <button
            type="button"
            aria-label={`${product.title} wishlist mein add karein`}
            className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-700 motion-reduce:transition-none"
          >
            <Heart className="h-5 w-5 text-maroon-700 dark:text-rose-400" />
          </button>
        )}

        {/* 🛒 Quick Add-to-Cart — slides up on desktop hover (hidden on touch/mobile) */}
        {!outOfStock && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-hover:pointer-events-auto motion-reduce:hidden sm:block hidden">
            <button
              type="button"
              aria-label={`${product.title} cart mein add karein`}
              className="flex w-full items-center justify-center gap-2 bg-maroon-800 py-3 text-sm font-bold tracking-wide text-amber-100 transition-colors duration-150 hover:bg-maroon-900 active:bg-maroon-950"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart Mein Dalein
            </button>
          </div>
        )}

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
