import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, count, size = "sm", showValue = true }: { value: number | null | undefined; count?: number; size?: "sm" | "md"; showValue?: boolean }) {
  const v = Number(value ?? 0);
  const px = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(px, i <= Math.round(v) ? "fill-gold-500 text-gold-500" : "fill-slate-200 text-slate-200")} />
        ))}
      </span>
      {showValue && v > 0 && <span className={cn("font-semibold text-slate-800 dark:text-stone-100", size === "md" ? "text-sm" : "text-xs")}>{v.toFixed(1)}</span>}
      {count !== undefined && <span className={cn("text-slate-600 dark:text-stone-400", size === "md" ? "text-sm" : "text-xs")}>({count})</span>}
    </span>
  );
}

export function RatingPill({ value, count }: { value: number | null | undefined; count?: number }) {
  const v = Number(value ?? 0);
  const n = typeof count === "number" ? count : 0;
  const hasRating = v > 0 || n > 0;

  if (!hasRating) {
    return (
      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-stone-500 font-normal whitespace-nowrap">
        No reviews yet
      </span>
    );
  }

  const displayRating = v > 0 ? v.toFixed(1) : "5.0";

  return (
    <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs whitespace-nowrap">
      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-700 dark:bg-emerald-600 px-1.5 py-0.5 font-bold text-white shadow-2xs">
        <span>{displayRating}</span>
        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-white" />
      </span>
      {n > 0 && (
        <span className="text-slate-600 dark:text-stone-300 font-medium">
          ({n})
        </span>
      )}
    </span>
  );
}
