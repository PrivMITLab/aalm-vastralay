/**
 * 👑 AALM VASTRALAY — FILTER SIDEBAR SKELETON LOADER
 * Location: src/components/ui/FilterSidebarSkeleton.tsx
 *
 * Conforms to docs/RULES.md Section 4.4 (CLS = 0 Contract):
 *  - Pre-renders matching category checkboxes, color swatch circles, and price range slider placeholders.
 *  - Prevents desktop and mobile catalog layout shift when filter counts/facets are loading.
 */

export default function FilterSidebarSkeleton() {
  return (
    <aside
      className="flex w-full flex-col gap-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
      aria-hidden="true"
    >
      {/* Header bar placeholder */}
      <div className="flex items-center justify-between border-b border-[color:var(--border)]/40 pb-3">
        <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
        <div className="h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
      </div>

      {/* Category Checkbox Placeholders */}
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-300 dark:bg-zinc-600 motion-reduce:animate-none" />
        <div className="space-y-2.5 pl-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
              <div
                className="h-3.5 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none"
                style={{ width: `${45 + (i * 9) % 35}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Slider Placeholder */}
      <div className="space-y-3 border-t border-[color:var(--border)]/40 pt-4">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-300 dark:bg-zinc-600 motion-reduce:animate-none" />
        <div className="h-2 w-full animate-pulse rounded-full bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
        <div className="flex justify-between">
          <div className="h-3.5 w-12 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
          <div className="h-3.5 w-14 animate-pulse rounded bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none" />
        </div>
      </div>

      {/* Ethnic Color Swatches Placeholder */}
      <div className="space-y-3 border-t border-[color:var(--border)]/40 pt-4">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-300 dark:bg-zinc-600 motion-reduce:animate-none" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-7 w-7 animate-pulse rounded-full bg-slate-200 dark:bg-zinc-700 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
