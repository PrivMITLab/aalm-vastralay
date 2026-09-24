export default function SizeGuideLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 animate-pulse space-y-6">
      <div className="h-4 w-40 bg-[color:var(--surface-2)] rounded" />
      <div className="h-24 w-2/3 mx-auto bg-[color:var(--surface-2)] rounded-xl" />
      <div className="h-28 w-full rounded-2xl bg-[color:var(--surface-2)]" />
      <div className="h-64 w-full rounded-xl bg-[color:var(--surface-2)]" />
    </div>
  );
}
