import type { Metadata } from "next";
import { desc, ilike, or } from "drizzle-orm";
import { FileText, Search, ShieldAlert, Trash2 } from "lucide-react";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { clearOldAuditLogs } from "@/actions/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit Logs – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  let logList: (typeof auditLogs.$inferSelect)[] = [];
  try {
    const baseQuery = db.select().from(auditLogs);
    if (q) {
      logList = await baseQuery
        .where(
          or(
            ilike(auditLogs.action, `%${q}%`),
            ilike(auditLogs.actorEmail, `%${q}%`),
            ilike(auditLogs.target, `%${q}%`),
            ilike(auditLogs.detail, `%${q}%`),
          ),
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(100);
    } else {
      logList = await baseQuery.orderBy(desc(auditLogs.createdAt)).limit(100);
    }
  } catch (err) {
    console.warn("[AdminAuditLogs] DB error:", err instanceof Error ? err.message : err);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">Security & Activity Audit Logs</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Append-only tamper-resistant log of all administrative actions, role updates, and settings changes.
          </p>
        </div>

        <form action={clearOldAuditLogs}>
          <button
            type="submit"
            className="btn btn-outline border-rose-300 text-rose-700 hover:bg-rose-50 text-xs flex items-center gap-1.5"
            title="Prune logs older than 180 days"
          >
            <Trash2 className="h-3.5 w-3.5" /> Prune Old Logs (&gt;180d)
          </button>
        </form>
      </header>

      {/* Search */}
      <div className="card p-4">
        <form method="get" className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-soft)]" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search audit trail by actor, action type, or target..."
              className="input w-full pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-primary text-xs">
            Filter
          </button>
          {q && (
            <a href="/admin/audit-logs" className="btn btn-outline text-xs">
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Audit Table */}
      <div className="card overflow-hidden">
        {logList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-10 w-10 text-[color:var(--text-soft)]" />
            <p className="mt-3 font-semibold text-[color:var(--brand)]">No audit logs recorded</p>
            <p className="text-xs text-[color:var(--text-soft)]">Privileged actions will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] text-xs uppercase text-[color:var(--text-soft)]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target & Detail</th>
                  <th className="px-4 py-3 text-right">IP / Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)] font-mono text-xs">
                {logList.map((log) => (
                  <tr key={log.id} className="hover:bg-[color:var(--surface-2)] transition-colors">
                    <td className="px-4 py-3 text-[color:var(--text-soft)] whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-[color:var(--text)]">{log.actorEmail ?? "System"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-[color:var(--surface-2)] px-2 py-0.5 font-bold text-[color:var(--brand)] border border-[color:var(--border)]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {log.target && <span className="font-semibold text-[color:var(--text)]">{log.target}: </span>}
                      <span className="text-[color:var(--text-soft)]">{log.detail ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-[color:var(--text-soft)]">
                      <div>{log.ip ?? "internal"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
