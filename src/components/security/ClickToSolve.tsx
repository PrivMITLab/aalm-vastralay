"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Loader2, RotateCcw, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { settingsSnapshot } from "@/lib/settings-snapshot";
import { WORKER_SOURCE, solveOnMainThread } from "./BotShield";
import type { PowChallenge } from "@/lib/pow";

export type PowDisplayMode = "standard" | "bar" | "floating" | "overlay" | "invisible";
export type PowWidgetStyle = "checkbox" | "switch";
export type PowTheme = "gold" | "royal-maroon" | "emerald" | "neutral";

type Phase = "idle" | "solving" | "ready" | "expired" | "failed" | "disabled";

const CLICK_TTL_SECONDS = 180;

export type ClickToSolveProps = {
  action: string;
  label?: string;
  name?: string;
  displayMode?: PowDisplayMode;
  widgetStyle?: PowWidgetStyle;
  accentTheme?: PowTheme;
  onVerified?: (ok: boolean) => void;
};

/**
 * Enterprise Turnstile-style click-to-solve proof-of-work defense (self-hosted).
 *
 * Supported Display Modes:
 * 1. standard  - Classic Turnstile card with checkbox/switch, prompt and Aalm Shield badge
 * 2. bar       - Slim horizontal inline ribbon for compact inputs (newsletter/footer)
 * 3. floating  - Floating corner badge (bottom-right) that expands or auto-anchors
 * 4. overlay   - Security gate modal overlay with backdrop blur
 * 5. invisible - Automatic background solving without manual interaction
 *
 * Supported Control Styles:
 * - checkbox: [ ] square toggle
 * - switch:   ( O ) iOS-style slide toggle
 */
export default function ClickToSolve({
  action,
  label,
  name = "botPayload",
  displayMode,
  widgetStyle,
  accentTheme,
  onVerified,
}: ClickToSolveProps) {
  const snap = settingsSnapshot();
  const resolvedMode: PowDisplayMode = displayMode ?? ((snap["security.powDisplayMode"] as PowDisplayMode) || "standard");
  const resolvedStyle: PowWidgetStyle = widgetStyle ?? ((snap["security.powWidgetStyle"] as PowWidgetStyle) || "checkbox");
  const resolvedLabel = label ?? snap["security.powLabel"] ?? "Main robot nahi hoon";
  const resolvedTheme: PowTheme = accentTheme ?? ((snap["security.powTheme"] as PowTheme) || "gold");

  const [phase, setPhase] = useState<Phase>("idle");
  const [payload, setPayload] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const verifiedRef = useRef(false);

  const notify = useCallback(
    (ok: boolean) => {
      if (verifiedRef.current === ok) return;
      verifiedRef.current = ok;
      onVerified?.(ok);
    },
    [onVerified],
  );

  const stopWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => stopWorker, [stopWorker]);

  // Countdown while ready; auto re-locks on expiry.
  useEffect(() => {
    if (phase !== "ready") return;
    const tick = () => {
      const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setPhase("expired");
        setPayload("");
        notify(false);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, expiresAt, notify]);

  const solve = useCallback(async () => {
    setPhase("solving");
    notify(false);
    const started = Date.now();
    try {
      const res = await fetch(`/api/security/challenge?action=${encodeURIComponent(action)}&ttl=${CLICK_TTL_SECONDS}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("challenge failed");
      const json = (await res.json()) as { enabled: boolean; challenge: PowChallenge };
      if (!json.enabled) {
        setPhase("disabled");
        notify(true);
        return;
      }
      const c = json.challenge;

      let number = -1;
      try {
        const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        const worker = new Worker(url);
        workerRef.current = worker;
        number = await new Promise<number>((resolve) => {
          const timeout = setTimeout(() => resolve(-1), 25000);
          worker.onmessage = (e: MessageEvent<{ number: number }>) => {
            clearTimeout(timeout);
            resolve(e.data.number);
          };
          worker.onerror = () => {
            clearTimeout(timeout);
            resolve(-1);
          };
          worker.postMessage(c);
        });
        URL.revokeObjectURL(url);
        stopWorker();
      } catch {
        number = -1;
      }
      if (number < 0) number = await solveOnMainThread(c);
      if (number < 0) {
        setPhase("failed");
        return;
      }
      setPayload(
        JSON.stringify({
          challenge: c,
          solution: { algorithm: c.algorithm, challenge: c.challenge, salt: c.salt, number, signature: c.signature, zeros: c.zeros },
        }),
      );
      setExpiresAt(c.expires);
      setElapsedMs(Date.now() - started);
      setPhase("ready");
      notify(true);
    } catch {
      stopWorker();
      setPhase("failed");
    }
  }, [action, notify, stopWorker]);

  // Auto-solve if configured as invisible
  useEffect(() => {
    if (resolvedMode === "invisible" && phase === "idle") {
      const timer = setTimeout(() => {
        void solve();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [resolvedMode, phase, solve]);

  if (phase === "disabled") return <input type="hidden" name={name} value="" />;

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  // Accent theme styling classes
  const themeColors = {
    gold: {
      borderActive: "border-[#D4AF37]",
      bgActive: "bg-[#D4AF37]/10",
      accentText: "text-[#D4AF37]",
      switchTrack: "bg-[#D4AF37]",
    },
    "royal-maroon": {
      borderActive: "border-[#7a1f2b]",
      bgActive: "bg-[#7a1f2b]/10",
      accentText: "text-[#7a1f2b] dark:text-[#f4e2a3]",
      switchTrack: "bg-[#7a1f2b]",
    },
    emerald: {
      borderActive: "border-emerald-500",
      bgActive: "bg-emerald-500/10",
      accentText: "text-emerald-600 dark:text-emerald-400",
      switchTrack: "bg-emerald-600",
    },
    neutral: {
      borderActive: "border-stone-500",
      bgActive: "bg-stone-500/10",
      accentText: "text-stone-700 dark:text-stone-300",
      switchTrack: "bg-stone-700 dark:bg-stone-400",
    },
  }[resolvedTheme];

  /* ------------------- Render Control Widget (Checkbox vs Switch) ------------------- */
  const renderControl = () => {
    if (resolvedStyle === "switch") {
      return (
        <span
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            phase === "ready"
              ? themeColors.switchTrack
              : phase === "solving"
                ? "bg-stone-300 dark:bg-stone-700"
                : phase === "failed" || phase === "expired"
                  ? "bg-amber-500/40"
                  : "bg-stone-200 dark:bg-stone-800",
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out grid place-items-center",
              phase === "ready" ? "translate-x-5" : "translate-x-0",
            )}
          >
            {phase === "solving" ? (
              <Loader2 className={cn("h-3 w-3 animate-spin", themeColors.accentText)} />
            ) : phase === "ready" ? (
              <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
            ) : phase === "failed" || phase === "expired" ? (
              <RotateCcw className="h-2.5 w-2.5 text-amber-600" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
            )}
          </span>
        </span>
      );
    }

    // Classic Checkbox control
    return (
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 transition-all shadow-2xs",
          phase === "failed" || phase === "expired"
            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600"
            : phase === "ready"
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-transparent hover:border-[#D4AF37]",
          phase === "solving" && cn(themeColors.borderActive, themeColors.bgActive),
        )}
        aria-hidden
      >
        {phase === "solving" ? (
          <Loader2 className={cn("h-5 w-5 animate-spin", themeColors.accentText)} />
        ) : phase === "ready" ? (
          <CheckCircle2 className="h-5 w-5 text-white" />
        ) : phase === "failed" || phase === "expired" ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <span className="h-3 w-3 rounded-xs border border-transparent" />
        )}
      </span>
    );
  };

  /* ------------------- 5 DISPLAY MODES ------------------- */

  // 1. INVISIBLE MODE: Zero visual obstruction, auto background solving
  if (resolvedMode === "invisible") {
    return (
      <div className="hidden">
        <input type="hidden" name={name} value={payload} />
      </div>
    );
  }

  // 2. BAR MODE: Slim horizontal ribbon for inline forms
  if (resolvedMode === "bar") {
    return (
      <div className="flex items-center justify-between gap-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1.5 text-xs shadow-2xs">
        <input type="hidden" name={name} value={payload} />
        {phase === "ready" ? (
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">सत्यापित (Verified)</span>
            <span className="text-[10px] text-[color:var(--text-soft)] font-mono">{mm}:{ss}</span>
          </div>
        ) : (
          <button
            type="button"
            role="checkbox"
            aria-checked={false}
            onClick={solve}
            disabled={phase === "solving"}
            className="flex items-center gap-2 font-medium text-[color:var(--text)] text-left hover:text-[#D4AF37] transition"
          >
            {renderControl()}
            <span className="truncate">{resolvedLabel}</span>
          </button>
        )}
        <div className="flex items-center gap-1 text-[9px] font-bold text-[#D4AF37] uppercase select-none opacity-80">
          <ShieldCheck className="h-3 w-3" />
          <span>Aalm</span>
        </div>
      </div>
    );
  }

  // 3. FLOATING MODE: Bottom-right pinned badge
  if (resolvedMode === "floating") {
    return (
      <>
        <input type="hidden" name={name} value={payload} />
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-2 shadow-xl backdrop-blur-md max-w-xs">
            {phase === "ready" ? (
              <div className="flex items-center gap-2.5 px-2 py-1 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">Verified</p>
                  <p className="text-[10px] font-mono text-[color:var(--text-soft)]">{mm}:{ss}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                role="checkbox"
                aria-checked={false}
                onClick={solve}
                disabled={phase === "solving"}
                className="flex items-center gap-2 px-1 text-xs text-left font-medium"
              >
                {renderControl()}
                <span className="min-w-0 pr-1">
                  <span className="block truncate font-semibold text-[color:var(--text)]">{resolvedLabel}</span>
                  <span className="block text-[10px] text-[color:var(--text-soft)]">
                    {phase === "solving" ? "Solving…" : "Click to solve"}
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // 4. OVERLAY MODE: Security gate modal overlay
  if (resolvedMode === "overlay" && !overlayDismissed) {
    return (
      <>
        <input type="hidden" name={name} value={payload} />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-2xl text-center space-y-4">
            <button
              type="button"
              onClick={() => setOverlayDismissed(true)}
              className="absolute top-4 right-4 text-[color:var(--text-soft)] hover:text-[color:var(--text)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[color:var(--brand)]">सुरक्षा सत्यापन (Security Gate)</h3>
              <p className="text-xs text-[color:var(--text-soft)] mt-1">
                फॉर्म सबमिट करने से पहले कृपया एक त्वरित सुरक्षा जांच पूरी करें।
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={phase === "ready"}
                onClick={phase === "ready" ? () => setOverlayDismissed(true) : solve}
                disabled={phase === "solving"}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  {renderControl()}
                  <span className="text-sm font-semibold text-[color:var(--text)]">
                    {phase === "ready" ? "सत्यापित! (जारी रखें)" : resolvedLabel}
                  </span>
                </div>
                {phase === "ready" && (
                  <span className="font-mono text-xs font-semibold text-emerald-600">{mm}:{ss}</span>
                )}
              </button>
            </div>
            {phase === "ready" && (
              <button
                type="button"
                onClick={() => setOverlayDismissed(true)}
                className="btn btn-primary w-full py-2 text-xs font-bold"
              >
                सत्यापन पूर्ण · फॉर्म पर वापस जाएं →
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // 5. STANDARD MODE (Default Turnstile-style card)
  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 sm:p-2.5 shadow-2xs transition-all hover:border-[color:var(--border-strong)]">
      <input type="hidden" name={name} value={payload} />
      {phase === "ready" ? (
        <div className="flex min-h-[44px] items-center justify-between gap-2 px-1" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white shadow-2xs">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                सत्यापित (Verified)
              </p>
              <p className="truncate text-[10px] sm:text-[11px] text-[color:var(--text-soft)]">
                वैधता: <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">{mm}:{ss}</span> · {Math.max(1, Math.round(elapsedMs))}ms
              </p>
            </div>
          </div>
          <div className="hidden min-[340px]:flex flex-col items-end shrink-0 pl-2 select-none border-l border-[color:var(--border)]/60">
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase whitespace-nowrap">
              <ShieldCheck className="h-3 w-3 text-[#D4AF37] shrink-0" />
              <span>Aalm</span>
            </div>
            <span className="text-[8px] sm:text-[9px] text-[color:var(--text-soft)] font-mono whitespace-nowrap">100% Private</span>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[44px] items-center justify-between gap-2">
          <button
            type="button"
            role="checkbox"
            aria-checked={false}
            onClick={solve}
            disabled={phase === "solving"}
            aria-disabled={phase === "solving"}
            aria-live="polite"
            className={cn(
              "flex flex-1 items-center gap-2.5 rounded-xl px-1 py-1 text-left transition min-w-0",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]",
              phase === "solving" ? "cursor-wait opacity-80" : "hover:bg-[color:var(--surface-2)]/60 active:scale-[0.99]",
            )}
          >
            {renderControl()}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs sm:text-sm font-semibold text-[color:var(--text)]">
                {resolvedLabel}
              </span>
              <span className="block truncate text-[10px] sm:text-[11px] text-[color:var(--text-soft)]">
                {phase === "solving"
                  ? "जांच हो रही है… (Verifying…)"
                  : phase === "failed"
                    ? "पुनः प्रयास करें (Click to retry)"
                    : phase === "expired"
                      ? "समय समाप्त (Expired — retry)"
                      : "क्लिक करके सत्यापित करें"}
              </span>
            </span>
          </button>
          <div className="hidden min-[340px]:flex flex-col items-end shrink-0 pr-1 pl-2 select-none border-l border-[color:var(--border)]/60">
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase whitespace-nowrap">
              <ShieldCheck className="h-3 w-3 text-[#D4AF37] shrink-0" />
              <span>Aalm</span>
            </div>
            <span className="text-[8px] sm:text-[9px] text-[color:var(--text-soft)] font-mono whitespace-nowrap">Shield</span>
          </div>
        </div>
      )}
    </div>
  );
}
