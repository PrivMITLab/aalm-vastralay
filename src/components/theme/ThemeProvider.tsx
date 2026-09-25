"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";

export type Prefs = {
  mode: ThemeMode;
  scale: number; // 0.9 – 1.2
  motion: boolean; // animations enabled
  density: "comfortable" | "compact";
};

export const DEFAULT_PREFS: Prefs = { mode: "light", scale: 1, motion: true, density: "comfortable" };

/**
 * Clamps text scale to 0.9–1.25 and guards NaN/undefined from
 * corrupted localStorage, preventing the "NaN% text size" display bug.
 */
export function sanitizeScale(raw: unknown): number {
  const n = typeof raw === "string" ? Number(raw) : (raw as number);
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) return 1;
  return Math.min(1.25, Math.max(0.9, Math.round(n * 100) / 100));
}

function sanitizePrefs(parsed: Partial<Prefs>): Partial<Prefs> {
  const clean: Partial<Prefs> = {};
  if (parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "system") clean.mode = parsed.mode;
  if (parsed.scale !== undefined) clean.scale = sanitizeScale(parsed.scale);
  if (typeof parsed.motion === "boolean") clean.motion = parsed.motion;
  if (parsed.density === "comfortable" || parsed.density === "compact") clean.density = parsed.density;
  return clean;
}

type Ctx = {
  prefs: Prefs;
  setPrefs: (patch: Partial<Prefs>) => void;
  toggleMode: () => void;
  resolvedMode: "light" | "dark";
  ready: boolean;
  openPanel: () => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
};

const ThemeContext = createContext<Ctx | null>(null);
const COOKIE = "av_prefs";

function writeCookie(prefs: Prefs) {
  const value = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function resolve(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export function ThemeProvider({ children, initial }: { children: React.ReactNode; initial: Prefs }) {
  const [prefs, setPrefsState] = useState<Prefs>(initial);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COOKIE);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Prefs>;
        queueMicrotask(() => {
          setPrefsState((prev) => ({ ...prev, ...sanitizePrefs(parsed) }));
        });
      }
    } catch {
      /* ignore */
    }
  }, []);
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [panelOpen, setPanelOpen] = useState(false);

  const resolvedMode = resolve(prefs.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedMode === "dark");
    root.classList.toggle("reduce-motion", !prefs.motion);
    root.classList.toggle("density-compact", prefs.density === "compact");
    root.style.setProperty("--font-scale", String(prefs.scale));
    root.style.colorScheme = resolvedMode;
  }, [resolvedMode, prefs.motion, prefs.density, prefs.scale]);

  useEffect(() => {
    if (prefs.mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.classList.toggle("dark", mq.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [prefs.mode]);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((prev) => {
      const sanitized = { ...patch };
      if (sanitized.scale !== undefined) sanitized.scale = sanitizeScale(sanitized.scale);
      const next = { ...prev, ...sanitized };
      try {
        window.localStorage.setItem(COOKIE, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      writeCookie(next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      prefs,
      setPrefs,
      resolvedMode,
      ready,
      panelOpen,
      setPanelOpen,
      openPanel: () => setPanelOpen(true),
      toggleMode: () => setPrefs({ mode: prefs.mode === "dark" ? "light" : "dark" }),
    }),
    [prefs, setPrefs, resolvedMode, ready, panelOpen],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
