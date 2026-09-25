import type { Metadata } from "next";
import { desc, eq, gte, sql } from "drizzle-orm";
import { AlertTriangle, KeyRound, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { db } from "@/db";
import { auditLogs, loginAttempts, rateLimits, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { clearOldAuditLogs, pruneRateLimits } from "@/actions/admin";
import { auditLabel } from "@/lib/audit";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Security & logs" };

export default async function AdminSecurityPage() {
  await requireRole(["admin"], "/admin/security");
  const settings = await getSettings();

  const [[attempts], [rlCount], logs, recentFailures] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        failed: sql<number>`count(*) filter (where success = false)::int`,
        last24: sql<number>`count(*) filter (where created_at > NOW() - INTERVAL '24 hours')::int`,
      })
      .from(loginAttempts),
    db.select({ n: sql<number>`count(*)::int` }).from(rateLimits),
    db
      .select({ log: auditLogs, actor: users.email })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(80),
    db
      .select({ identifier: loginAttempts.identifier, failures: sql<number>`count(*)::int`, last: sql<string>`max(created_at)::text` })
      .from(loginAttempts)
      .where(sql`${loginAttempts.createdAt} >= NOW() - INTERVAL '24 hours'`)
      .groupBy(loginAttempts.identifier)
      .having(sql`count(*) filter (where success = false) > 0`)
      .orderBy(desc(sql`count(*)`))
      .limit(8),
  ]);

  const controls = [
    ["Proof-of-work bot shield", settings["security.botProtection"] === "pow" ? `Active · ${settings["security.powDifficulty"]} zero weight · up to ${settings["security.powMaxIterations"]} iterations` : "Disabled"],
    ["Bot shield presentation", `${settings["security.powDisplayMode"] || "standard"} layout · ${settings["security.powWidgetStyle"] || "checkbox"} control · ${settings["security.powTheme"] || "gold"} accent`],
    ["Form rate limit", `${settings["security.formRateLimit"]} submissions / minute / IP`],
    ["Sign-in throttle", `${settings["security.authRateLimit"]} attempts / 10 minutes / IP`],
    ["API throttle", `${settings["security.apiRateLimit"]} requests / minute / IP`],
    ["Account lockout", `${settings["security.lockThreshold"]} failures → ${settings["security.lockMinutes"]} minute lock`],
    ["Session lifetime", `${settings["security.sessionDays"]} days · rotated on password change`],
    ["Strong password policy", settings["security.requireStrongPassword"] === "true" ? "Enabled (8+ chars, mixed case + digit)" : "Relaxed (6+ chars)"],
    ["Proxy header trust", settings["security.trustProxyHeaders"] === "true" ? "Cloudflare / XFF honoured" : "Direct socket only"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[color:var(--brand)]">Security & activity logs</h1>
        <p className="text-sm text-[color:var(--text-soft)]">Bot protection, throttling, brute-force defence and a tamper-evident audit trail.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Lock className="h-5 w-5" />} label="Sign-in attempts" value={String(attempts?.total ?? 0)} sub={`${attempts?.failed ?? 0} failed · ${attempts?.last24 ?? 0} in 24h`} />
        <Stat icon={<ShieldCheck className="h-5 w-5" />} label="Audit entries" value={String(logs.length >= 80 ? "80+" : logs.length)} sub="newest first" />
        <Stat icon={<KeyRound className="h-5 w-5" />} label="Active rate windows" value={String(rlCount?.n ?? 0)} sub="per IP · per action" />
        <Stat icon={<AlertTriangle className="h-5 w-5" />} label="Accounts with failures" value={String(recentFailures.length)} sub="last 24 hours" />
      </div>

      <section className="card p-5">
        <h2 className="font-semibold text-[color:var(--brand)]">Active protection</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {controls.map(([label, value]) => (
            <li key={label} className="rounded-xl border border-[color:var(--border)] p-3 text-sm">
              <p className="font-medium">{label}</p>
              <p className="text-xs text-[color:var(--text-soft)]">{value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[color:var(--text-soft)]">
          Security headers (CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy) are applied to every response by the edge middleware, and all
          server actions re-verify authentication + ownership server-side — the client is never trusted.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <form action={pruneRateLimits}>
            <SubmitButton variant="outline" className="btn-sm" pendingText="Cleaning…">
              <Trash2 className="h-4 w-4" /> Prune rate-limit data
            </SubmitButton>
          </form>
          <form action={clearOldAuditLogs}>
            <SubmitButton variant="ghost" className="btn-sm" pendingText="Cleaning…">
              <Trash2 className="h-4 w-4" /> Clear logs older than 180 days
            </SubmitButton>
          </form>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="card overflow-hidden">
          <header className="border-b border-[color:var(--border)] px-5 py-3">
            <h2 className="font-semibold text-[color:var(--brand)]">Audit trail</h2>
            <p className="text-xs text-[color:var(--text-soft)]">Who did what, when, from which IP – append-only.</p>
          </header>
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[color:var(--surface-2)] text-left text-xs tracking-wider text-[color:var(--text-soft)] uppercase">
                <tr>
                  <th className="px-4 py-2">When</th>
                  <th className="px-4 py-2">Actor</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Target / detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[color:var(--text-soft)]">
                      No activity recorded yet.
                    </td>
                  </tr>
                )}
                {logs.map(({ log, actor }) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 text-xs whitespace-nowrap text-[color:var(--text-soft)]">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="font-medium">{log.actorEmail ?? actor ?? "system"}</span>
                      <span className="block font-mono text-[10px] text-[color:var(--text-soft)]">{log.ip ?? "—"}</span>
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <span className="badge">{auditLabel(log.action)}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-[color:var(--text-muted)]">
                      {log.target && <span className="font-medium">{log.target}</span>}
                      {log.detail && <span className="block text-[color:var(--text-soft)]">{log.detail}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-[color:var(--brand)]">Recent failed sign-ins</h2>
          {recentFailures.length === 0 ? (
            <p className="mt-2 text-sm text-[color:var(--text-soft)]">No failed attempts in the last 24 hours. 🎉</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {recentFailures.map((f) => (
                <li key={f.identifier} className="flex items-center justify-between rounded-xl border border-[color:var(--border)] px-3 py-2">
                  <span className="truncate font-mono text-xs">{f.identifier}</span>
                  <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{f.failures} fails</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-[color:var(--text-soft)]">
            Accounts lock automatically after {settings["security.lockThreshold"]} failures for {settings["security.lockMinutes"]} minutes. Error messages never reveal whether an
            email exists, so accounts cannot be enumerated; password hashes use scrypt with a per-user salt.
          </p>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand)]">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-xl font-bold text-[color:var(--brand)]">{value}</p>
        <p className="truncate text-xs text-[color:var(--text-soft)]">
          {label} · {sub}
        </p>
      </div>
    </div>
  );
}
