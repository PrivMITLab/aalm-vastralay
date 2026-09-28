/**
 * KpiCard.tsx
 * Bento Grid 2.0 KPI card — admin aur seller dashboards ke liye.
 * Reusable, strictly typed, zero external dependencies.
 * ui-ux-pro-max skill: Asymmetric content-prioritized visual containers.
 */
import type React from "react";

type KpiAccent = "maroon" | "gold" | "emerald" | "blue" | "purple";

interface KpiCardProps {
  /** Card ka title / label */
  label: string;
  /** Main metric value (e.g., "₹1,24,500" or "342") */
  value: string;
  /** Optional sub-label (e.g., "Last 30 days") */
  subLabel?: string;
  /** Optional delta string (e.g., "+12% vs last week") */
  delta?: string;
  /** Delta positive (green) ya negative (red) */
  deltaPositive?: boolean;
  /** Lucide icon ya any React node */
  icon: React.ReactNode;
  /** Color accent theme */
  accent?: KpiAccent;
  /** Bento: span 2 columns for hero KPI */
  colSpan2?: boolean;
  /** Optional click link href */
  href?: string;
}

const accentMap: Record<KpiAccent, { icon: string; ring: string; badge: string }> = {
  maroon:  { icon: "bg-maroon-100 text-maroon-800 dark:bg-maroon-900/40 dark:text-rose-300",   ring: "ring-maroon-200 dark:ring-maroon-800",   badge: "bg-maroon-50 dark:bg-maroon-950/60" },
  gold:    { icon: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",     ring: "ring-amber-200 dark:ring-amber-800",     badge: "bg-amber-50 dark:bg-amber-950/60" },
  emerald: { icon: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-800", badge: "bg-emerald-50 dark:bg-emerald-950/60" },
  blue:    { icon: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",         ring: "ring-blue-200 dark:ring-blue-800",       badge: "bg-blue-50 dark:bg-blue-950/60" },
  purple:  { icon: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300", ring: "ring-purple-200 dark:ring-purple-800",   badge: "bg-purple-50 dark:bg-purple-950/60" },
};

export default function KpiCard({
  label,
  value,
  subLabel,
  delta,
  deltaPositive = true,
  icon,
  accent = "maroon",
  colSpan2 = false,
  href,
}: KpiCardProps) {
  const colors = accentMap[accent];

  const inner = (
    <div
      className={`group relative flex flex-col justify-between gap-3 rounded-2xl border border-[color:var(--border)] ${colors.badge} p-4 sm:p-5 shadow-xs ring-1 ${colors.ring} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none ${colSpan2 ? "sm:col-span-2" : ""}`}
    >
      {/* Top row: icon + delta badge */}
      <div className="flex items-start justify-between gap-2">
        <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${colors.icon} shadow-xs`}>
          {icon}
        </span>

        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
              deltaPositive
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            {deltaPositive ? "▲" : "▼"} {delta}
          </span>
        )}
      </div>

      {/* Main value */}
      <div className="space-y-0.5">
        <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-[color:var(--text)] tracking-tight">
          {value}
        </p>
        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">
          {label}
        </p>
        {subLabel && (
          <p className="text-[11px] text-[color:var(--text-soft)] opacity-80">{subLabel}</p>
        )}
      </div>

      {/* Hover arrow hint for clickable cards */}
      {href && (
        <span className="absolute right-4 bottom-4 text-[color:var(--text-soft)] opacity-0 transition-opacity duration-200 group-hover:opacity-60">
          →
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className={colSpan2 ? "sm:col-span-2" : undefined}>
        {inner}
      </a>
    );
  }

  return inner;
}
