export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 animate-pulse space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-[color:var(--surface-2)] rounded" />

      {/* Header skeleton */}
      <div className="h-40 w-full rounded-2xl bg-[color:var(--surface-2)]" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-[color:var(--surface-2)]" />
        ))}
      </div>
    </div>
  );
}
