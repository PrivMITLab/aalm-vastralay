"use client";

import { MessageCircle, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/utils";

type MobileStickyBarProps = {
  title: string;
  price: number;
  mrp?: number;
  slug: string;
};

export default function MobileStickyBar({ title, price, mrp, slug }: MobileStickyBarProps) {
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleScrollToBuy = () => {
    // Smoothly scroll to the purchase panel
    const el = document.getElementById("purchase-panel") || document.querySelector("form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const productUrl = typeof window !== "undefined" ? window.location.href : `https://aalmvastralay.com/products/${slug}`;
  const waText = encodeURIComponent(`नमस्ते! मुझे यह ${title} पसंद है (₹${price.toLocaleString("en-IN")})। क्या यह साइज और कलर में उपलब्ध है?\n${productUrl}`);
  const waUrl = `https://wa.me/?text=${waText}`;

  return (
    <div className="no-print fixed inset-x-0 bottom-14 z-30 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 px-3 py-2.5 shadow-xl backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between gap-2.5">
        {/* Price & Discount */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-[color:var(--brand)]">{formatINR(price)}</span>
            {discount > 0 && (
              <span className="rounded bg-emerald-50 px-1 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                {discount}% OFF
              </span>
            )}
          </div>
          <p className="line-clamp-1 text-[10px] text-[color:var(--text-muted)]">COD Available · Free Delivery</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* WhatsApp share/ask button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
            aria-label="Ask on WhatsApp"
            title="WhatsApp par poochein"
          >
            <MessageCircle className="h-5 w-5" />
          </a>

          {/* Add / Buy Button */}
          <button
            type="button"
            onClick={handleScrollToBuy}
            className="btn btn-primary flex h-10 items-center gap-1.5 px-4 text-xs font-bold active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
            अभी खरीदें (Buy Now)
          </button>
        </div>
      </div>
    </div>
  );
}
