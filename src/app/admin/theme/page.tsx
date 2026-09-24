import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";
import ThemeEditorForm from "@/components/admin/ThemeEditorForm";

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

      <ThemeEditorForm
        initialPrimary={primary}
        initialAccent={accent}
        initialAccentLight={accentLight}
        initialBg={bg}
        initialRadius={radius}
        initialLogoText={logoText}
        initialSiteName={siteName}
        initialTagline={tagline}
      />
    </div>
  );
}
