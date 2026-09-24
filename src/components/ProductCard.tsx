import Link from "next/link";
import { Truck, Flame } from "lucide-react";
import type { Product } from "@/db/schema";
import { firstImage } from "@/lib/media-resolver";
import { formatINR, freeShippingThreshold } from "@/lib/utils";
import Watermark from "@/components/Watermark";
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
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const discount = Math.round(Number(product.discountPercent ?? 0));
  const mrp = product.mrp ?? product.price;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock > 0 && product.stock <= 3;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card card-lift group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]"
      aria-label={`${product.title} - ${formatINR(product.price)}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100 dark:bg-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={firstImage(product.images, { width: 600, thumbnail: false })}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Discount Badge with Shimmer */}
        {discount > 0 && !outOfStock && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs ${
              discount >= 30
                ? "bg-gradient-to-r from-maroon-700 via-rose-600 to-maroon-700 animate-shimmer"
                : "bg-maroon-700"
            }`}
          >
            {discount}% OFF
          </span>
        )}

        {/* Urgency Stock / Out of Stock Badges */}
        {outOfStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 py-1.5 text-center text-xs font-semibold text-white backdrop-blur-xs">
            Out of stock
          </span>
        ) : lowStock ? (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
            <Flame className="h-3 w-3 fill-current" /> Only {product.stock} left!
          </span>
        ) : null}

        <Watermark variant="card" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        {product.storeName && (
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-stone-400">
            {product.storeName}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-slate-900 transition-colors group-hover:text-maroon-700 dark:text-stone-100 dark:group-hover:text-rose-400">
          {product.title}
        </h3>

        <div className="mt-auto flex items-baseline gap-2 pt-1.5">
          <span className="text-base font-bold text-maroon-900 dark:text-rose-300">
            {formatINR(product.price)}
          </span>
          {mrp > product.price && (
            <span className="text-xs text-slate-400 line-through dark:text-stone-500">
              {formatINR(mrp)}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-[color:var(--border)]/40 pt-2 text-xs">
          <RatingPill value={product.rating} count={product.totalReviews} />
          {product.price >= freeShippingThreshold() && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <Truck className="h-3 w-3" /> Free Delivery
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
