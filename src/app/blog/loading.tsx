export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 animate-pulse space-y-8">
      <div className="h-4 w-40 bg-[color:var(--surface-2)] rounded" />
      <div className="h-24 w-2/3 mx-auto bg-[color:var(--surface-2)] rounded-2xl" />
      <div className="h-80 w-full rounded-2xl bg-[color:var(--surface-2)]" />
      <div className="grid gap-6 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-[color:var(--surface-2)]" />
        ))}
      </div>
    </div>
  );
}
