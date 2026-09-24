export default function FAQLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 animate-pulse space-y-6">
      <div className="h-4 w-40 bg-[color:var(--surface-2)] rounded" />
      <div className="h-20 w-3/4 mx-auto bg-[color:var(--surface-2)] rounded-xl" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 w-full rounded-xl bg-[color:var(--surface-2)]" />
        ))}
      </div>
    </div>
  );
}
