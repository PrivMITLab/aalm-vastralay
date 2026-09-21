"use client";

import { useState, useTransition } from "react";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { removeCartItem, updateCartQuantity } from "@/actions/cart";

export default function CartItemControls({ itemId, quantity, max }: { itemId: string; quantity: number; max: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const change = (q: number) =>
    startTransition(async () => {
      setError(null);
      const res = await updateCartQuantity(itemId, q);
      if (!res.ok && res.error) setError(res.error);
    });

  const remove = () =>
    startTransition(async () => {
      await removeCartItem(itemId);
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-full border border-cream-300 bg-white">
        <button type="button" onClick={() => change(quantity - 1)} disabled={pending} className="p-1.5 text-slate-600 hover:text-maroon-700 disabled:opacity-50" aria-label="Decrease">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-7 text-center text-sm font-semibold">{pending ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : quantity}</span>
        <button
          type="button"
          onClick={() => change(quantity + 1)}
          disabled={pending || quantity >= Math.min(10, max)}
          className="p-1.5 text-slate-600 hover:text-maroon-700 disabled:opacity-50"
          aria-label="Increase"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button type="button" onClick={remove} disabled={pending} className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 hover:underline disabled:opacity-50">
        <Trash2 className="h-3.5 w-3.5" /> Remove
      </button>
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </div>
  );
}
