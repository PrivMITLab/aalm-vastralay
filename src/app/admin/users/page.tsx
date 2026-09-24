import type { Metadata } from "next";
import { desc, ilike, or } from "drizzle-orm";
import { Search, ShieldAlert, UserCheck, Users } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { updateUserRole } from "@/actions/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "User Management – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  let userList: (typeof users.$inferSelect)[] = [];
  try {
    const query = db.select().from(users);
    if (q) {
      userList = await query
        .where(
          or(
            ilike(users.email, `%${q}%`),
            ilike(users.fullName, `%${q}%`),
            ilike(users.phone, `%${q}%`),
          ),
        )
        .orderBy(desc(users.createdAt))
        .limit(100);
    } else {
      userList = await query.orderBy(desc(users.createdAt)).limit(100);
    }
  } catch (err) {
    console.warn("[AdminUsers] DB error:", err instanceof Error ? err.message : err);
  }

  const counts = {
    total: userList.length,
    customers: userList.filter((u) => u.role === "customer").length,
    sellers: userList.filter((u) => u.role === "seller").length,
    admins: userList.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">User Management</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Manage customer, seller, and administrator accounts across the marketplace.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Total Accounts</p>
          <p className="mt-2 font-display text-2xl font-bold text-[color:var(--brand)]">{counts.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Customers</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-800">{counts.customers}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Sellers</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-700">{counts.sellers}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-soft)]">Admins</p>
          <p className="mt-2 font-display text-2xl font-bold text-purple-700">{counts.admins}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <form method="get" className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-soft)]" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search users by name, email, or phone..."
              className="input w-full pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-primary text-xs">
            Search
          </button>
          {q && (
            <a href="/admin/users" className="btn btn-outline text-xs">
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {userList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-10 w-10 text-[color:var(--text-soft)]" />
            <p className="mt-3 font-semibold text-[color:var(--brand)]">No users found</p>
            <p className="text-xs text-[color:var(--text-soft)]">No registered users match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] text-xs uppercase text-[color:var(--text-soft)]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {userList.map((u) => {
                  const maskedPhone = u.phone
                    ? u.phone.length > 4
                      ? `${"*".repeat(Math.max(0, u.phone.length - 4))}${u.phone.slice(-4)}`
                      : u.phone
                    : "—";

                  return (
                    <tr key={u.id} className="hover:bg-[color:var(--surface-2)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[color:var(--text)]">{u.fullName ?? "Anonymous User"}</div>
                        <div className="text-xs text-[color:var(--text-soft)]">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[color:var(--text-soft)]">{maskedPhone}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "seller"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role === "admin" ? <ShieldAlert className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[color:var(--text-soft)]">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={updateUserRole} className="inline-flex items-center gap-1.5">
                          <input type="hidden" name="userId" value={u.id} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1 text-xs text-[color:var(--text)]"
                          >
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button type="submit" className="btn btn-outline py-1 px-2 text-xs">
                            Update
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
