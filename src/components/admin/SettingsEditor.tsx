"use client";

import { useActionState, useMemo, useState } from "react";
import { ExternalLink, Plus, RotateCcw, Save, Sparkles, Trash2 } from "lucide-react";
import { resetSettingsGroup, updateSettings } from "@/actions/admin";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import SubmitButton from "@/components/SubmitButton";
import { cn } from "@/lib/utils";
import type { SettingField } from "@/lib/settings";

type Group = { id: string; label: string; icon: string };

type SectionRow = { key: string; name: string; enabled: boolean; order: number; limit: number };

export default function SettingsEditor({
  groups,
  fields,
  values,
  activeGroup,
}: {
  groups: readonly Group[];
  fields: SettingField[];
  values: Record<string, string>;
  activeGroup: string;
}) {
  const [state, action] = useActionState(updateSettings, null);
  const [live, setLive] = useState<Record<string, string>>(values);
  const groupFields = useMemo(() => fields.filter((f) => f.group === activeGroup), [fields, activeGroup]);
  const isPreviewable = ["brand", "theme", "home"].includes(activeGroup);

  const setValue = (key: string, value: string) => setLive((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <nav className="card flex flex-wrap gap-1 p-2">
          {groups.map((g) => (
            <a
              key={g.id}
              href={`/admin/settings?group=${g.id}`}
              className={cn("chip", activeGroup === g.id && "chip-active")}
            >
              <span aria-hidden>{g.icon}</span> {g.label}
            </a>
          ))}
        </nav>

        <form onSubmit={preventDoubleSubmit} action={action} className="card space-y-5 p-5">
          <input type="hidden" name="__group" value={activeGroup} />
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-semibold text-[color:var(--brand)]">{groups.find((g) => g.id === activeGroup)?.label}</h2>
              <p className="text-xs text-[color:var(--text-soft)]">{groupFields.length} options · saved instantly and applied to every visitor</p>
            </div>
            <div className="flex gap-2">
              <SubmitButton pendingText="Saving…">
                <Save className="h-4 w-4" /> Save changes
              </SubmitButton>
            </div>
          </header>

          {groupFields.map((field) => (
            <FieldRow key={field.key} field={field} value={live[field.key] ?? field.default} onChange={(v) => setValue(field.key, v)} />
          ))}

          {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{state.error}</p>}
          {state?.success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{state.success}</p>}

          <div className="flex flex-wrap items-center gap-3 border-t border-[color:var(--border)] pt-4">
            <SubmitButton pendingText="Saving…">
              <Save className="h-4 w-4" /> Save {groups.find((g) => g.id === activeGroup)?.label}
            </SubmitButton>
            <button type="submit" formAction={resetSettingsGroup} className="btn btn-ghost btn-sm" name="__group" value={activeGroup}>
              <RotateCcw className="h-4 w-4" /> Reset this section to defaults
            </button>
          </div>
        </form>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-40 xl:h-fit">
        {isPreviewable ? (
          <div className="card overflow-hidden">
            <p className="flex items-center gap-2 border-b border-[color:var(--border)] px-4 py-2 text-xs font-bold tracking-wider text-[color:var(--text-soft)] uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Live preview
            </p>
            {activeGroup === "brand" && (
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  {live["site.logoUrl"] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={live["site.logoUrl"]} alt="" className="h-9 w-auto max-w-[8rem] object-contain" />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--brand)] font-display text-lg text-[color:var(--accent)]">{live["site.logoText"]}</span>
                  )}
                  <p className="font-display text-lg font-semibold text-[color:var(--brand)]">{live["site.name"]}</p>
                </div>
                <div className="marquee-wrap overflow-hidden rounded-lg bg-[color:var(--brand)] py-1.5 text-[color:var(--brand-fg)]">
                  <p className="truncate px-3 text-[11px]">{(live["site.announcements"] ?? "").split("|")[0]}</p>
                </div>
                <p className="text-xs text-[color:var(--text-soft)]">{live["site.tagline"]}</p>
              </div>
            )}
            {activeGroup === "theme" && (
              <div className="space-y-3 p-4">
                <div className="flex gap-2">
                  <Swatch label="Primary" color={live["theme.primary"]} />
                  <Swatch label="Accent" color={live["theme.accent"]} />
                  <Swatch label="Dark bg" color={live["theme.bgDark"]} />
                </div>
                <div className="rounded-xl border border-[color:var(--border)] p-3" style={{ borderRadius: live["theme.radius"] }}>
                  <p className="font-display text-lg font-semibold" style={{ color: live["theme.primary"], fontFamily: live["theme.fontDisplay"] }}>
                    Lehenga · साड़ी
                  </p>
                  <p className="text-xs text-[color:var(--text-soft)]">Corner radius {live["theme.radius"]} · density {live["theme.density"]}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full px-3 py-1 text-xs text-white" style={{ background: live["theme.primary"] }}>
                      Buy now
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs" style={{ background: live["theme.accent"] }}>
                      Add to bag
                    </span>
                  </div>
                </div>
              </div>
            )}
            {activeGroup === "home" && (
              <div className="space-y-3 p-4">
                <div className="relative overflow-hidden rounded-xl" style={{ height: 150 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={live["home.bannerUrl"]} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(Number(live["home.bannerOverlay"]) || 0) / 100})` }} />
                  <div className="absolute inset-0 flex flex-col justify-center gap-1 p-3 text-white">
                    <span className="w-fit rounded-full bg-black/40 px-2 py-0.5 text-[10px]">{live["home.bannerBadge"]}</span>
                    <p className="line-clamp-2 font-display text-sm font-semibold">{live["home.bannerTitle"]}</p>
                    <span className="w-fit rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-black">{live["home.bannerCtaLabel"]}</span>
                  </div>
                </div>
                <p className="text-xs text-[color:var(--text-soft)]">
                  Grid: {live["home.gridMobile"]} / {live["home.gridTablet"]} / {live["home.gridDesktop"]} columns (mobile / tablet / desktop) · height {live["home.bannerHeight"]}px
                </p>
              </div>
            )}
            <p className="border-t border-[color:var(--border)] px-4 py-2 text-[11px] text-[color:var(--text-soft)]">Preview updates as you type; press Save to publish.</p>
          </div>
        ) : (
          <div className="card p-4 text-sm text-[color:var(--text-muted)]">
            <p className="font-semibold text-[color:var(--brand)]">Heads-up</p>
            <p className="mt-1 text-xs">
              These options change real behaviour (pricing, commissions, security). Changes are written to the settings table, applied within a second, and recorded in the
              audit log.
            </p>
          </div>
        )}

        <div className="card p-4 text-xs text-[color:var(--text-soft)]">
          <p className="font-semibold text-[color:var(--brand)]">Preview on the live site</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a href="/" target="_blank" className="chip">
              Homepage <ExternalLink className="h-3 w-3" />
            </a>
            <a href="/products" target="_blank" className="chip">
              Catalogue <ExternalLink className="h-3 w-3" />
            </a>
            <a href="/admin/security" className="chip">
              Audit trail
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex-1">
      <div className="h-12 w-full rounded-lg border border-[color:var(--border)]" style={{ background: color }} />
      <p className="mt-1 text-[10px] text-[color:var(--text-soft)]">{label}</p>
    </div>
  );
}

function FieldRow({ field, value, onChange }: { field: SettingField; value: string; onChange: (value: string) => void }) {
  const id = `set-${field.key}`;
  return (
    <div className="rounded-2xl border border-[color:var(--border)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-xl">
          <label htmlFor={id} className="text-sm font-semibold">
            {field.label}
          </label>
          {field.help && <p className="mt-0.5 text-xs text-[color:var(--text-soft)]">{field.help}</p>}
        </div>
        <code className="rounded bg-[color:var(--surface-2)] px-2 py-0.5 text-[10px] text-[color:var(--text-soft)]">{field.key}</code>
      </div>
      <div className="mt-3">
        {field.type === "boolean" ? (
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <input type="hidden" name={`${field.key}__present`} value="1" />
            <input id={id} type="checkbox" name={field.key} defaultChecked={value === "true"} value="on" className="h-4 w-4 accent-[color:var(--brand)]" />
            Enabled
          </label>
        ) : field.type === "select" ? (
          <select id={id} name={field.key} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea id={id} name={field.key} className="input" value={value} onChange={(e) => onChange(e.target.value)} />
        ) : field.type === "list" ? (
          <>
            <textarea id={id} name={field.key} className="input" value={value.replace(/\|/g, "\n")} onChange={(e) => onChange(e.target.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).join("|"))} />
            <p className="mt-1 text-xs text-[color:var(--text-soft)]">One entry per line.</p>
          </>
        ) : field.key === "home.sections" ? (
          <SectionsEditor id={id} value={value} onChange={onChange} />
        ) : field.type === "json" ? (
          <textarea id={id} name={field.key} className="input font-mono text-xs" rows={5} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : field.type === "color" ? (
          <div className="flex items-center gap-3">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-[color:var(--border)] bg-transparent" aria-label={`${field.label} picker`} />
            <input id={id} name={field.key} className="input w-40 font-mono" value={value} onChange={(e) => onChange(e.target.value)} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              id={id}
              name={field.key}
              type={field.type === "number" ? "number" : "text"}
              min={field.min}
              max={field.max}
              step={field.type === "number" ? "any" : undefined}
              className="input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            {field.unit && <span className="text-sm text-[color:var(--text-soft)]">{field.unit}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionsEditor({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  let rows: SectionRow[] = [];
  try {
    rows = JSON.parse(value) as SectionRow[];
  } catch {
    rows = [];
  }
  const commit = (next: SectionRow[]) => onChange(JSON.stringify(next.sort((a, b) => a.order - b.order)));

  return (
    <div className="space-y-2">
      <input type="hidden" id={id} name="home.sections" value={JSON.stringify(rows)} />
      <ul className="space-y-1.5">
        {rows.map((row, index) => (
          <li key={row.key} className="flex flex-wrap items-center gap-2 rounded-xl border border-[color:var(--border)] p-2 text-sm">
            <label className="flex flex-1 items-center gap-2">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(e) => {
                  const next = [...rows];
                  next[index] = { ...row, enabled: e.target.checked };
                  commit(next);
                }}
                className="h-4 w-4 accent-[color:var(--brand)]"
              />
              <span className="font-medium">{row.name}</span>
              <code className="text-[10px] text-[color:var(--text-soft)]">{row.key}</code>
            </label>
            <label className="flex items-center gap-1 text-xs">
              order
              <input
                type="number"
                min={1}
                className="input w-16 py-1"
                value={row.order}
                onChange={(e) => {
                  const next = [...rows];
                  next[index] = { ...row, order: Number(e.target.value) };
                  commit(next);
                }}
              />
            </label>
            <label className="flex items-center gap-1 text-xs">
              items
              <input
                type="number"
                min={1}
                max={24}
                className="input w-16 py-1"
                value={row.limit}
                onChange={(e) => {
                  const next = [...rows];
                  next[index] = { ...row, limit: Number(e.target.value) };
                  commit(next);
                }}
              />
            </label>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => commit([...rows, { key: `custom${rows.length + 1}`, name: "New section", enabled: false, order: rows.length + 1, limit: 4 }])}
        >
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
        {rows.length > 0 && (
          <button type="button" className="btn btn-ghost btn-sm text-rose-600" onClick={() => commit([])}>
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
      <p className="text-xs text-[color:var(--text-soft)]">Tick to show a homepage section, set its order and how many products it renders. Unknown keys are ignored safely.</p>
    </div>
  );
}
