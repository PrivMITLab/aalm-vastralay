export default function BlogPostLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 animate-pulse space-y-6">
      <div className="h-4 w-40 bg-[color:var(--surface-2)] rounded" />
      <div className="h-10 w-3/4 bg-[color:var(--surface-2)] rounded" />
      <div className="h-4 w-1/3 bg-[color:var(--surface-2)] rounded" />
      <div className="aspect-[16/9] w-full bg-[color:var(--surface-2)] rounded-2xl" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-[color:var(--surface-2)] rounded" />
        <div className="h-4 w-5/6 bg-[color:var(--surface-2)] rounded" />
        <div className="h-4 w-4/6 bg-[color:var(--surface-2)] rounded" />
      </div>
    </div>
  );
}
