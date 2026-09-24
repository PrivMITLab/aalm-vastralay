export default function AdminUsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[color:var(--surface-2)]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-20 bg-[color:var(--surface-2)]" />
        ))}
      </div>
      <div className="card h-12 bg-[color:var(--surface-2)]" />
      <div className="card h-80 bg-[color:var(--surface-2)]" />
    </div>
  );
}
