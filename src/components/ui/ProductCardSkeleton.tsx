/**
 * ProductCardSkeleton.tsx
 * Exact dimension-matched skeleton for ProductCard component.
 * - aspect-[3/4] image area matches ProductCard image container
 * - Title, store name, price pill placeholders prevent CLS
 * - CLS = 0 guarantee: dimensions match loaded card pixel-perfect
 * Rules.md Section 4.4: Har async card ka skeleton mandatory hai.
 */

export default function ProductCardSkeleton() {
  return (
    <div
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]"
      aria-hidden="true"
    >
      {/* Image area — exact aspect-[3/4] match karta hai ProductCard se */}
      <div className="aspect-[3/4] w-full animate-pulse bg-cream-100 dark:bg-stone-800 motion-reduce:animate-none" />

      {/* Info area */}
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-3.5">
        {/* Store name placeholder */}
        <div className="h-2.5 w-2/5 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />

        {/* Title lines — 2-line clamp match */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
        </div>

        {/* Price row */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-5 w-1/3 animate-pulse rounded bg-slate-300 dark:bg-zinc-600 motion-reduce:animate-none" />
          <div className="h-3.5 w-1/4 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
        </div>

        {/* Rating + delivery row */}
        <div className="mt-2 flex items-center justify-between border-t border-[color:var(--border)]/40 pt-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
