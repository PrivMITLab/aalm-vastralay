"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Heart, Loader2, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { addToCart, toggleWishlist } from "@/actions/cart";
import { cn, formatINR } from "@/lib/utils";

export type VariantOption = { id: string; size: string | null; color: string | null; stock: number; priceAdjustment: number };

export default function PurchasePanel({
  productId,
  price,
  stock,
  variants,
  initialWishlisted,
}: {
  productId: string;
  price: number;
  stock: number;
  variants: VariantOption[];
  initialWishlisted: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"cart" | "buy" | "wish" | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);

  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[], [variants]);
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[], [variants]);
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState<string | null>(colors.length === 1 ? colors[0] : null);

  const hasVariants = variants.length > 0;
  const selected = hasVariants
    ? variants.find((v) => (sizes.length ? v.size === size : true) && (colors.length ? v.color === color : true))
    : undefined;
  const needsSelection = hasVariants && ((sizes.length > 0 && !size) || (colors.length > 0 && !color));
  const available = hasVariants ? (selected?.stock ?? 0) : stock;
  const effectivePrice = price + (selected?.priceAdjustment ?? 0);

  const sizeAvailable = (s: string) => variants.some((v) => v.size === s && (colors.length && color ? v.color === color : true) && v.stock > 0);
  const colorAvailable = (c: string) => variants.some((v) => v.color === c && (sizes.length && size ? v.size === size : true) && v.stock > 0);

  function run(kind: "cart" | "buy") {
    if (needsSelection) {
      setMessage({ type: "err", text: `Please select ${!size && sizes.length ? "a size" : "a colour"}.` });
      return;
    }
    if (available <= 0) {
      setMessage({ type: "err", text: "This option is out of stock." });
      return;
    }
    setBusy(kind);
    setMessage(null);
    startTransition(async () => {
      const res = await addToCart(productId, selected?.id ?? null, qty);
      setBusy(null);
      if (res.requiresAuth) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) {
        setMessage({ type: "err", text: res.error ?? "Something went wrong." });
        return;
      }
      if (kind === "buy") {
        router.push("/checkout");
      } else {
        setMessage({ type: "ok", text: "Added to your bag!" });
        router.refresh();
      }
    });
  }

  function wish() {
    setBusy("wish");
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      setBusy(null);
      if (res.requiresAuth) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
        return;
      }
      if (res.ok) setWishlisted(Boolean(res.wishlisted));
    });
  }

  return (
    <div className="space-y-5">
      {selected && selected.priceAdjustment !== 0 && (
        <p className="text-sm text-slate-600">
          Price for this option: <span className="font-semibold text-maroon-900">{formatINR(effectivePrice)}</span>
        </p>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">
            Select Size {size && <span className="font-normal text-slate-500">· {size}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const ok = sizeAvailable(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-11 rounded-full border px-3 py-1.5 text-sm transition",
                    size === s ? "border-maroon-700 bg-maroon-700 text-white" : "border-cream-300 bg-white hover:border-maroon-400",
                    !ok && "opacity-40 line-through",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">
            Select Colour {color && <span className="font-normal text-slate-500">· {color}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const ok = colorAvailable(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    color === c ? "border-maroon-700 bg-maroon-700 text-white" : "border-cream-300 bg-white hover:border-maroon-400",
                    !ok && "opacity-40 line-through",
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-cream-300 bg-white">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 text-slate-600 hover:text-maroon-700" aria-label="Decrease">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(10, Math.max(1, Math.min(available || 10, q + 1))))}
            className="p-2 text-slate-600 hover:text-maroon-700"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className={cn("text-xs font-medium", available > 0 ? (available <= 5 ? "text-amber-700" : "text-emerald-700") : "text-rose-700")}>
          {needsSelection ? "Select options to see availability" : available > 0 ? (available <= 5 ? `Hurry! Only ${available} left` : "In stock") : "Out of stock"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => run("cart")} disabled={pending} className="btn btn-outline flex-1 sm:flex-none sm:px-8">
          {busy === "cart" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />} Add to Bag
        </button>
        <button type="button" onClick={() => run("buy")} disabled={pending} className="btn btn-primary flex-1 sm:flex-none sm:px-8">
          {busy === "buy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Buy Now
        </button>
        <button
          type="button"
          onClick={wish}
          disabled={pending}
          aria-label="Wishlist"
          className={cn("grid h-11 w-11 place-items-center rounded-full border transition", wishlisted ? "border-maroon-700 bg-maroon-50 text-maroon-700" : "border-cream-300 bg-white text-slate-600 hover:text-maroon-700")}
        >
          {busy === "wish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-5 w-5", wishlisted && "fill-maroon-700")} />}
        </button>
      </div>

      {message && (
        <p className={cn("flex items-center gap-1.5 text-sm font-medium", message.type === "ok" ? "text-emerald-700" : "text-rose-700")}>
          {message.type === "ok" && <Check className="h-4 w-4" />} {message.text}
        </p>
      )}
    </div>
  );
}
