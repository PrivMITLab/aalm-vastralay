"use client";

import { useState } from "react";
import { Palette, Sparkles } from "lucide-react";
import { updateSettingsDirect } from "@/actions/admin";
import SubmitButton from "@/components/SubmitButton";

interface ThemeEditorProps {
  initialPrimary: string;
  initialAccent: string;
  initialAccentLight: string;
  initialBg: string;
  initialRadius: string;
  initialLogoText: string;
  initialSiteName: string;
  initialTagline: string;
}

export default function ThemeEditorForm({
  initialPrimary,
  initialAccent,
  initialAccentLight,
  initialBg,
  initialRadius,
  initialLogoText,
  initialSiteName,
  initialTagline,
}: ThemeEditorProps) {
  const [primary, setPrimary] = useState(initialPrimary);
  const [accent, setAccent] = useState(initialAccent);
  const [accentLight, setAccentLight] = useState(initialAccentLight);
  const [bg, setBg] = useState(initialBg);
  const [radius, setRadius] = useState(initialRadius);
  const [logoText, setLogoText] = useState(initialLogoText);
  const [siteName, setSiteName] = useState(initialSiteName);
  const [tagline, setTagline] = useState(initialTagline);

  return (
    <div className="space-y-6">
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
                  value={primary}
                  className="h-9 w-12 cursor-pointer rounded border border-[color:var(--border)] p-0.5"
                  onChange={(e) => setPrimary(e.target.value)}
                />
                <input
                  id="theme-primary-text"
                  type="text"
                  name="theme.primary"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
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
                  value={accent}
                  className="h-9 w-12 cursor-pointer rounded border border-[color:var(--border)] p-0.5"
                  onChange={(e) => setAccent(e.target.value)}
                />
                <input
                  id="theme-accent-text"
                  type="text"
                  name="theme.accent"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
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
                  value={accentLight}
                  className="h-9 w-12 cursor-pointer rounded border border-[color:var(--border)] p-0.5"
                  onChange={(e) => setAccentLight(e.target.value)}
                />
                <input
                  id="theme-accentlight-text"
                  type="text"
                  name="theme.accentLight"
                  value={accentLight}
                  onChange={(e) => setAccentLight(e.target.value)}
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
                value={bg}
                onChange={(e) => setBg(e.target.value)}
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
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
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
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
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
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
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
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="input w-full text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <SubmitButton className="btn btn-primary text-sm px-6" pendingText="Saving…">
              Save Theme Changes
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
