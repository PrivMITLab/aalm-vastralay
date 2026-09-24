export default function ShippingLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 animate-pulse space-y-6">
      <div className="h-4 w-40 bg-[color:var(--surface-2)] rounded" />
      <div className="h-24 w-2/3 mx-auto bg-[color:var(--surface-2)] rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-[color:var(--surface-2)]" />
        ))}
      </div>
      <div className="h-48 w-full rounded-xl bg-[color:var(--surface-2)]" />
    </div>
  );
}
