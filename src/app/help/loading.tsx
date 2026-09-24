export default function HelpLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 animate-pulse space-y-8">
      <div className="h-4 w-40 bg-[color:var(--surface-2)] rounded" />
      <div className="h-28 w-2/3 mx-auto bg-[color:var(--surface-2)] rounded-2xl" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-[color:var(--surface-2)]" />
        ))}
      </div>
    </div>
  );
}
