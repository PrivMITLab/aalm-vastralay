import type { Metadata } from "next";
import { Palette, Sparkles } from "lucide-react";
import { getSetting } from "@/lib/settings";
import { updateSettingsDirect } from "@/actions/admin";

export const metadata: Metadata = { title: "Theme & Brand Identity – Admin Console" };
export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  const [primary, accent, accentLight, bg, radius, logoText, siteName, tagline] = await Promise.all([
    getSetting("theme.primary", "#4A148C"),
    getSetting("theme.accent", "#D4AF37"),
    getSetting("theme.accentLight", "#E6CA65"),
    getSetting("theme.bg", "#faf8f5"),
    getSetting("theme.radius", "16px"),
    getSetting("site.logoText", "AV"),
    getSetting("site.name", "Aalm Vastralay"),
    getSetting("site.tagline", "Wedding & Ethnic Wear · Kalyanipur"),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--brand)]">Theme & Brand Design</h1>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Customize royal color palettes, typography accents, and storefront branding tokens.
          </p>
        </div>
      </header>

      {/* Live Brand Palette Card */}
      <div className="card p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] mb-4 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" /> Active Luxury Identity Palette
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[color:var(--border)] p-4 text-center" style={{ backgroundColor: primary }}>
            <span className="font-mono text-xs font-bold text-white uppercase">{primary}</span>
            <p className="text-xs text-purple-200 mt-1">Royal Purple (Brand)</p>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] p-4 text-center" style={{ backgroundColor: accent }}>
            <span className="font-mono text-xs font-bold text-slate-900 uppercase">{accent}</span>
            <p className="text-xs text-slate-900 font-semibold mt-1">Imperial Gold (Accent)</p>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] p-4 text-center" style={{ backgroundColor: accentLight }}>
            <span className="font-mono text-xs font-bold text-slate-900 uppercase">{accentLight}</span>
            <p className="text-xs text-slate-900 font-semibold mt-1">Light Gold</p>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] p-4 text-center" style={{ backgroundColor: bg }}>
            <span className="font-mono text-xs font-bold text-slate-800 uppercase">{bg}</span>
            <p className="text-xs text-slate-600 mt-1">Canvas Surface</p>
          </div>
        </div>

        {/* Live Typography Preview */}
        <div className="mt-6 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
          <p className="text-xs font-mono text-[color:var(--text-soft)]">Live Brand Typography Preview:</p>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg font-bold shadow-xs text-sm"
              style={{ backgroundColor: primary, color: accent }}
            >
              {logoText}
            </div>
            <div>
              <p className="font-display text-xl font-bold" style={{ color: primary }}>{siteName}</p>
              <p className="text-xs text-[color:var(--text-soft)]">{tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings Form */}
      <div className="card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand)] mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-[color:var(--accent)]" /> Color Tokens & Identity Settings
        </h2>

        <form action={updateSettingsDirect} className="space-y-4">
          <input type="hidden" name="__group" value="theme" />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue={primary}
                  className="h-9 w-12 cursor-pointer rounded border border-[color:var(--border)] p-0.5"
                  onChange={(e) => {
                    const textInput = document.getElementById("theme-primary-text") as HTMLInputElement;
                    if (textInput) textInput.value = e.target.value;
                  }}
                />
                <input
                  id="theme-primary-text"
                  type="text"
                  name="theme.primary"
                  defaultValue={primary}
                  className="input flex-1 font-mono text-sm uppercase"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Imperial Gold Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue={accent}
                  className="h-9 w-12 cursor-pointer rounded border border-[color:var(--border)] p-0.5"
                  onChange={(e) => {
                    const textInput = document.getElementById("theme-accent-text") as HTMLInputElement;
                    if (textInput) textInput.value = e.target.value;
                  }}
                />
                <input
                  id="theme-accent-text"
                  type="text"
                  name="theme.accent"
                  defaultValue={accent}
                  className="input flex-1 font-mono text-sm uppercase"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Light Gold Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue={accentLight}
                  className="h-9 w-12 cursor-pointer rounded border border-[color:var(--border)] p-0.5"
                  onChange={(e) => {
                    const textInput = document.getElementById("theme-accentlight-text") as HTMLInputElement;
                    if (textInput) textInput.value = e.target.value;
                  }}
                />
                <input
                  id="theme-accentlight-text"
                  type="text"
                  name="theme.accentLight"
                  defaultValue={accentLight}
                  className="input flex-1 font-mono text-sm uppercase"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Background Canvas Color
              </label>
              <input
                type="text"
                name="theme.bg"
                defaultValue={bg}
                className="input w-full font-mono text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Border Radius
              </label>
              <input
                type="text"
                name="theme.radius"
                defaultValue={radius}
                className="input w-full font-mono text-sm"
              />
            </div>
          </div>

          <hr className="my-4 border-[color:var(--border)]" />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Brand Name
              </label>
              <input
                type="text"
                name="site.name"
                defaultValue={siteName}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Logo Monogram Text
              </label>
              <input
                type="text"
                name="site.logoText"
                defaultValue={logoText}
                className="input w-full text-sm font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Tagline
              </label>
              <input
                type="text"
                name="site.tagline"
                defaultValue={tagline}
                className="input w-full text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary text-sm px-6">
              Save Theme Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
