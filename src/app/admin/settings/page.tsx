import type { Metadata } from "next";
import { Info } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getSettings, SETTINGS_FIELDS, SETTINGS_GROUPS } from "@/lib/settings";
import SettingsEditor from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Site settings" };

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  await requireRole(["admin"], "/admin/settings");
  const { group } = await searchParams;
  const activeGroup = SETTINGS_GROUPS.some((g) => g.id === group) ? group! : "brand";
  const values = await getSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[color:var(--brand)]">Site settings</h1>
        <p className="text-sm text-[color:var(--text-soft)]">
          Banner, grid, colours, currency, shipping, commissions, security and feature switches – all editable here without touching code.
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 text-xs text-[color:var(--text-muted)]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
        Money handling stays in INR internally for every order, invoice and payout – currency conversion only changes what shoppers see. Every save is validated, applied
        instantly and written to the audit log.
      </p>

      <SettingsEditor groups={SETTINGS_GROUPS} fields={SETTINGS_FIELDS} values={values} activeGroup={activeGroup} />
    </div>
  );
}
