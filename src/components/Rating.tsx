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
      {showValue && v > 0 && <span className={cn("font-semibold text-slate-700", size === "md" ? "text-sm" : "text-xs")}>{v.toFixed(1)}</span>}
      {count !== undefined && <span className={cn("text-slate-500", size === "md" ? "text-sm" : "text-xs")}>({count})</span>}
    </span>
  );
}

export function RatingPill({ value, count }: { value: number | null | undefined; count?: number }) {
  const v = Number(value ?? 0);
  if (!v) return <span className="text-xs text-slate-400">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 font-bold text-white">
        {v.toFixed(1)} <Star className="h-3 w-3 fill-white" />
      </span>
      {count !== undefined && <span className="text-slate-500">({count})</span>}
    </span>
  );
}
