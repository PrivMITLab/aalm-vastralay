import Link from "next/link";
import { Truck } from "lucide-react";
import type { Product } from "@/db/schema";
import { firstImage } from "@/lib/media-resolver";
import { formatINR, freeShippingThreshold } from "@/lib/utils";
import Watermark from "@/components/Watermark";
import { RatingPill } from "./Rating";

export type ProductCardData = Pick<Product, "id" | "title" | "slug" | "price" | "mrp" | "discountPercent" | "images" | "rating" | "totalReviews" | "stock"> & {
  storeName?: string | null;
  storeSlug?: string | null;
};

export default function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const discount = Math.round(Number(product.discountPercent ?? 0));
  const mrp = product.mrp ?? product.price;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-[0_12px_32px_rgba(122,31,43,0.12)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={firstImage(product.images, { width: 600, thumbnail: false })}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && !outOfStock && (
          <span className="absolute left-2 top-2 rounded-md bg-maroon-700 px-2 py-0.5 text-[11px] font-bold text-white shadow">{discount}% OFF</span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-slate-900/70 py-1.5 text-center text-xs font-semibold text-white">Out of stock</span>
        )}
        <Watermark variant="card" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.storeName && <p className="truncate text-[11px] uppercase tracking-wide text-slate-500">{product.storeName}</p>}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-slate-800 group-hover:text-maroon-800">{product.title}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold text-maroon-900">{formatINR(product.price)}</span>
          {mrp > product.price && <span className="text-xs text-slate-400 line-through">{formatINR(mrp)}</span>}
        </div>
        <div className="flex items-center justify-between">
          <RatingPill value={product.rating} count={product.totalReviews} />
          {product.price >= freeShippingThreshold() && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <Truck className="h-3 w-3" /> Free delivery
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
