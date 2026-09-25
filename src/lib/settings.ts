import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { settings as settingsTable } from "@/db/schema";
import { refreshDisplayConfig, type DisplayConfig } from "./format";
import { writeSettingsSnapshot } from "./settings-snapshot";
import {
  SETTINGS_DEFAULTS,
  SETTINGS_FIELDS,
  SETTINGS_GROUPS,
  parseList,
  parseJson,
  type HomeSection,
  type SettingField,
  type SettingsMap,
} from "./settings-defs";

export {
  SETTINGS_DEFAULTS,
  SETTINGS_FIELDS,
  SETTINGS_GROUPS,
  SETTING_KEYS,
  parseList,
  parseJson,
} from "./settings-defs";
export type { HomeSection, SettingField, SettingsMap } from "./settings-defs";

/* ------------------------------------------------------------------ */
/*  Editable site configuration – every value can be changed from      */
/*  /admin/settings without touching code or redeploying.              */
/* ------------------------------------------------------------------ */

/** Tag for Vercel shared data cache — revalidated on every admin settings save. */
export const SITE_SETTINGS_TAG = "site-settings";

let snapshot: { values: SettingsMap; at: number } | null = null;
const TTL_MS = 60_000;

/**
 * Called after settings writes so the change is visible immediately.
 * Clears the in-process snapshot AND busts the Vercel shared data cache
 * so all Lambda instances pick up the new values within seconds.
 * Must be called from a Server Action context (same pattern as invalidateCatalog).
 */
export async function invalidateSettings() {
  snapshot = null;
  const { updateTag } = await import("next/cache");
  updateTag(SITE_SETTINGS_TAG);
}

async function readAll(): Promise<SettingsMap> {
  const values: SettingsMap = { ...SETTINGS_DEFAULTS };
  try {
    const rows = await db.select().from(settingsTable);
    for (const row of rows) {
      if (row.value !== null) values[row.key] = row.value;
    }
  } catch {
    // Table not yet migrated – fall back to defaults so the UI never breaks.
  }
  snapshot = { values, at: Date.now() };
  writeSettingsSnapshot(values);
  refreshDisplayConfig({
    currencySymbol: values["commerce.currencySymbol"] || "₹",
    currencyCode: values["commerce.currencyCode"] || "INR",
    rateFromINR: Number(values["commerce.rateFromINR"]) || 1,
    rounding: (values["commerce.priceRounding"] as DisplayConfig["rounding"]) ?? "none",
    weightUnit: (values["commerce.weightUnit"] as DisplayConfig["weightUnit"]) ?? "kg",
  });
  return values;
}

/**
 * Shared data cache — survives across Lambda cold starts on Vercel.
 * TTL: 1 hour. Busted immediately by invalidateSettings() after admin saves.
 * L1: in-process 60s snapshot (TTL_MS) avoids redundant unstable_cache calls.
 */
const getSettingsCached = unstable_cache(readAll, ["site-settings-v1"], {
  revalidate: 3600,
  tags: [SITE_SETTINGS_TAG],
});

/** Request-deduped settings read (L1: in-process, L2: shared data cache). */
export const getSettings = cache(async (): Promise<SettingsMap> => {
  if (snapshot && Date.now() - snapshot.at < TTL_MS) return snapshot.values;
  return getSettingsCached();
});

/** Values read synchronously by formatting helpers (display-only, never money calculations). */
export function settingsSnapshot(): SettingsMap {
  return snapshot?.values ?? SETTINGS_DEFAULTS;
}

export async function getSetting(key: string, fallback?: string) {
  const values = await getSettings();
  return values[key] ?? fallback ?? SETTINGS_DEFAULTS[key] ?? "";
}

export async function getSettingNumber(key: string, fallback = 0) {
  const raw = await getSetting(key);
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export async function getSettingBool(key: string, fallback = false) {
  const raw = await getSetting(key);
  if (raw === "") return fallback;
  return raw === "true" || raw === "1" || raw === "on";
}

export type BrandConfig = {
  name: string;
  tagline: string;
  logoText: string;
  logoUrl: string;
  faviconEmoji: string;
  announcements: string[];
  announcementSpeed: number;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  copyright: string;
  social: { instagram: string; youtube: string; facebook: string };
};

export async function getBrand(): Promise<BrandConfig> {
  const s = await getSettings();
  return {
    name: s["site.name"],
    tagline: s["site.tagline"],
    logoText: s["site.logoText"],
    logoUrl: s["site.logoUrl"],
    faviconEmoji: s["site.faviconEmoji"],
    announcements: parseList(s["site.announcements"]),
    announcementSpeed: Number(s["site.announcementSpeed"]) || 26,
    phone: s["site.phone"],
    whatsapp: s["site.whatsapp"],
    email: s["site.email"],
    address: s["site.address"],
    copyright: s["site.copyright"],
    social: { instagram: s["site.socialInstagram"], youtube: s["site.socialYoutube"], facebook: s["site.socialFacebook"] },
  };
}

export type ThemeConfig = {
  defaultMode: "light" | "dark" | "system";
  allowUserToggle: boolean;
  primary: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  bgLight: string;
  bgDark: string;
  surfaceDark: string;
  radius: string;
  fontDisplay: string;
  density: "comfortable" | "compact";
};

export async function getTheme(): Promise<ThemeConfig> {
  const s = await getSettings();
  return {
    defaultMode: (s["theme.defaultMode"] as ThemeConfig["defaultMode"]) ?? "light",
    allowUserToggle: s["theme.allowUserToggle"] === "true",
    primary: s["theme.primary"],
    primaryLight: s["theme.primaryLight"],
    accent: s["theme.accent"],
    accentLight: s["theme.accentLight"],
    bgLight: s["theme.bgLight"],
    bgDark: s["theme.bgDark"],
    surfaceDark: s["theme.surfaceDark"],
    radius: s["theme.radius"],
    fontDisplay: s["theme.fontDisplay"],
    density: (s["theme.density"] as ThemeConfig["density"]) ?? "comfortable",
  };
}

export type CommerceConfig = {
  currencySymbol: string;
  currencyCode: string;
  rateFromINR: number;
  rounding: "none" | "nearest1" | "nearest5" | "nearest10";
  freeShippingThreshold: number;
  shippingFee: number;
  codFee: number;
  returnWindowDays: number;
  gstPercent: number;
  gstInclusive: boolean;
  minOrderValue: number;
  weightUnit: "kg" | "g";
  showWeight: boolean;
};

export async function getCommerce(): Promise<CommerceConfig> {
  const s = await getSettings();
  return {
    currencySymbol: s["commerce.currencySymbol"] || "₹",
    currencyCode: s["commerce.currencyCode"] || "INR",
    rateFromINR: Number(s["commerce.rateFromINR"]) || 1,
    rounding: (s["commerce.priceRounding"] as CommerceConfig["rounding"]) ?? "none",
    freeShippingThreshold: Number(s["commerce.freeShippingThreshold"]) || 0,
    shippingFee: Number(s["commerce.shippingFee"]) || 0,
    codFee: Number(s["commerce.codFee"]) || 0,
    returnWindowDays: Number(s["commerce.returnWindowDays"]) || 7,
    gstPercent: Number(s["commerce.gstPercent"]) || 0,
    gstInclusive: s["commerce.gstInclusive"] === "true",
    minOrderValue: Number(s["commerce.minOrderValue"]) || 0,
    weightUnit: (s["commerce.weightUnit"] as "kg" | "g") ?? "kg",
    showWeight: s["commerce.showWeight"] === "true",
  };
}

export type HomeConfig = {
  banner: {
    url: string;
    height: number;
    overlay: number;
    badge: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    cta2Label: string;
    cta2Href: string;
  };
  grid: { desktop: number; tablet: number; mobile: number };
  sections: HomeSection[];
  occasions: string[];
  categoryCards: Record<string, string>;
};

export async function getHomeConfig(): Promise<HomeConfig> {
  const s = await getSettings();
  return {
    banner: {
      url: (!s["home.bannerUrl"] || s["home.bannerUrl"] === "/brand/poster.jpg") ? "/brand/poster.png" : s["home.bannerUrl"],
      height: Number(s["home.bannerHeight"]) || 520,
      overlay: Number(s["home.bannerOverlay"]) ?? 62,
      badge: s["home.bannerBadge"],
      title: s["home.bannerTitle"],
      subtitle: s["home.bannerSubtitle"],
      ctaLabel: s["home.bannerCtaLabel"],
      ctaHref: s["home.bannerCtaHref"],
      cta2Label: s["home.bannerCta2Label"],
      cta2Href: s["home.bannerCta2Href"],
    },
    grid: {
      desktop: Number(s["home.gridDesktop"]) || 4,
      tablet: Number(s["home.gridTablet"]) || 3,
      mobile: Number(s["home.gridMobile"]) || 2,
    },
    sections: parseJson<HomeSection[]>(s["home.sections"], []).slice().sort((a, b) => a.order - b.order),
    occasions: parseList(s["home.occasions"]),
    categoryCards: parseJson<Record<string, string>>(s["home.categoryCards"], {}),
  };
}

/** Seed the settings table with any missing keys (called from admin + instrumentation). */
export async function ensureSettingsRows() {
  const existing = await db.select({ key: settingsTable.key }).from(settingsTable);
  const known = new Set(existing.map((r) => r.key));
  const missing = SETTINGS_FIELDS.filter((f) => !known.has(f.key));
  if (missing.length === 0) return 0;
  await db
    .insert(settingsTable)
    .values(missing.map((f) => ({ key: f.key, value: f.default, group: f.group, label: f.label })))
    .onConflictDoNothing();
  return missing.length;
}

export async function getSettingsByGroup(group: string) {
  const rows = await db.select().from(settingsTable).where(inArray(settingsTable.group, [group]));
  return rows.sort((a, b) => (a.label ?? a.key).localeCompare(b.label ?? b.key));
}
