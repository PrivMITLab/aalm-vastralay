"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronsRight,
  Crown,
  Fingerprint,
  Loader2,
  Lock,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { settingsSnapshot } from "@/lib/settings-snapshot";
import { WORKER_SOURCE, solveOnMainThread } from "./BotShield";
import type { PowChallenge } from "@/lib/pow";

export type PowDisplayMode =
  | "turnstile"
  | "altcha"
  | "mcaptcha"
  | "slide"
  | "biometric"
  | "shagun"
  | "bar"
  | "floating"
  | "overlay"
  | "invisible"
  | "standard";

export type PowWidgetStyle = "checkbox" | "switch";
export type PowTheme = "gold" | "royal-maroon" | "emerald" | "neutral";

type Phase = "idle" | "solving" | "ready" | "expired" | "failed" | "disabled";

const CLICK_TTL_SECONDS = 180;

/** Synthesized browser Web Audio verification chime (0KB, no audio files). */
function playVerifiedChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Ignore audio permission or autoplay constraints
  }
}

export type ClickToSolveProps = {
  action: string;
  label?: string;
  name?: string;
  displayMode?: PowDisplayMode;
  widgetStyle?: PowWidgetStyle;
  accentTheme?: PowTheme;
  onVerified?: (ok: boolean) => void;
  className?: string;
};

/**
 * Enterprise Turnstile & Multi-Archetype Bot Defense (100% Self-Hosted, $0 Cost).
 *
 * Supported 10 Archetypes:
 * 1. turnstile (or standard) - Cloudflare Turnstile luxury card with rotating dual-ring loader
 * 2. altcha    - Authentic cryptographic ALTCHA PoW card with difficulty meter & lock
 * 3. mcaptcha  - Privacy-first mCaptcha box with real-time speed metric & progress bar
 * 4. slide     - Apple/Fintech interactive Slide-to-Unlock / Swipe-to-Verify rail
 * 5. biometric - Touch & Pulse biometric fingerprint with expanding radar aura
 * 6. shagun    - Aalm Royal Ethnic Seal (शाही मुहर) golden medallion coin stamp
 * 7. bar       - Ultra-slim 32px inline ribbon for compact newsletter / footer inputs
 * 8. floating  - Screen corner pinned security shield badge
 * 9. overlay   - Security gate modal overlay with backdrop blur
 * 10. invisible- Background auto-solve with zero visual UI footprint
 */
export default function ClickToSolve({
  action,
  label,
  name = "botPayload",
  displayMode,
  widgetStyle,
  accentTheme,
  onVerified,
  className,
}: ClickToSolveProps) {
  const snap = settingsSnapshot();
  const rawMode = displayMode ?? ((snap["security.powDisplayMode"] as PowDisplayMode) || "turnstile");
  const resolvedMode: PowDisplayMode = rawMode === "standard" ? "turnstile" : rawMode;
  const resolvedStyle: PowWidgetStyle = widgetStyle ?? ((snap["security.powWidgetStyle"] as PowWidgetStyle) || "checkbox");
  const resolvedLabel = label ?? snap["security.powLabel"] ?? "Main robot nahi hoon";
  const resolvedTheme: PowTheme = accentTheme ?? ((snap["security.powTheme"] as PowTheme) || "gold");
  const playSound = snap["security.powSound"] !== "false";

  const [phase, setPhase] = useState<Phase>("idle");
  const [payload, setPayload] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sliderPos, setSliderPos] = useState(0); // 0 to 100%
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const verifiedRef = useRef(false);

  const notify = useCallback(
    (ok: boolean) => {
      if (verifiedRef.current === ok) return;
      verifiedRef.current = ok;
      onVerified?.(ok);
      if (ok && playSound) {
        playVerifiedChime();
      }
    },
    [onVerified, playSound],
  );

  const stopWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => stopWorker, [stopWorker]);

  // Countdown timer when ready; auto re-locks on expiry
  useEffect(() => {
    if (phase !== "ready") return;
    const tick = () => {
      const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setPhase("expired");
        setPayload("");
        setSliderPos(0);
        notify(false);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, expiresAt, notify]);

  const [retryCount, setRetryCount] = useState(0);
  const [failureMsg, setFailureMsg] = useState("");

  const solve = useCallback(async () => {
    if (phase === "solving" || phase === "ready") return;
    setPhase("solving");
    setSliderPos(50);
    const started = Date.now();

    try {
      // Exponential backoff if retrying
      if (retryCount > 0) {
        const delay = Math.min(1000 * Math.pow(1.5, retryCount - 1), 3000);
        await new Promise((r) => setTimeout(r, delay));
      }

      const res = await fetch(`/api/security/challenge?action=${encodeURIComponent(action)}&ttl=${CLICK_TTL_SECONDS}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        // Network or server error (e.g. 429, 500) — do NOT disable protection, prompt retry
        stopWorker();
        setSliderPos(0);
        setRetryCount((c) => Math.min(c + 1, 3));
        setFailureMsg("Suraksha load nahi hui, net check karke dobara dabao (Retry)");
        setPhase("failed");
        notify(false);
        return;
      }

      const data = await res.json();
      const isRequired = Boolean(data.required ?? data.enabled);

      if (!isRequired) {
        // Bot protection is explicitly disabled by admin
        setPhase("disabled");
        notify(true);
        return;
      }

      if (!data.challenge) {
        stopWorker();
        setSliderPos(0);
        setRetryCount((c) => Math.min(c + 1, 3));
        setFailureMsg("Suraksha load nahi hui, net check karke dobara dabao (Retry)");
        setPhase("failed");
        notify(false);
        return;
      }

      const c: PowChallenge = data.challenge;

      // Solve via inline Web Worker with reliable fallback to main thread
      let solutionNumber = -1;
      try {
        const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        const w = new Worker(url);
        workerRef.current = w;

        solutionNumber = await new Promise<number>((resolve) => {
          const timeout = setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve(-1);
          }, 15000);

          w.onmessage = (ev: MessageEvent<{ number?: number }>) => {
            clearTimeout(timeout);
            URL.revokeObjectURL(url);
            if (typeof ev.data?.number === "number") {
              resolve(ev.data.number);
            } else {
              resolve(-1);
            }
          };
          w.onerror = () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(url);
            resolve(-1);
          };
          w.postMessage({
            challenge: c.challenge,
            salt: c.salt,
            algorithm: c.algorithm,
            maxnumber: c.maxnumber,
            zeros: c.zeros,
            iterations: c.iterations,
          });
        });
      } catch {
        solutionNumber = -1;
      }

      if (solutionNumber < 0) {
        solutionNumber = await solveOnMainThread(c);
      }

      if (solutionNumber < 0) {
        throw new Error("Unable to solve proof-of-work challenge");
      }

      const packed = JSON.stringify({
        challenge: c,
        solution: {
          algorithm: c.algorithm,
          challenge: c.challenge,
          salt: c.salt,
          number: solutionNumber,
          signature: c.signature,
          zeros: c.zeros,
        },
      });

      stopWorker();
      setPayload(packed);
      setExpiresAt(c.expires);
      setElapsedMs(Date.now() - started);
      setSliderPos(100);
      setPhase("ready");
      setRetryCount(0);
      setFailureMsg("");
      notify(true);
    } catch {
      stopWorker();
      setSliderPos(0);
      setRetryCount((c) => Math.min(c + 1, 3));
      setFailureMsg("Suraksha load nahi hui, net check karke dobara dabao (Retry)");
      setPhase("failed");
      notify(false);
    }
  }, [action, phase, notify, stopWorker, retryCount]);


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
      pillGlow: "shadow-[0_0_12px_rgba(212,175,55,0.4)]",
    },
    "royal-maroon": {
      borderActive: "border-[#722F37]",
      bgActive: "bg-[#722F37]/15",
      accentText: "text-[#722F37] dark:text-[#E89BA5]",
      switchTrack: "bg-[#722F37]",
      pillGlow: "shadow-[0_0_12px_rgba(114,47,55,0.4)]",
    },
    emerald: {
      borderActive: "border-emerald-600",
      bgActive: "bg-emerald-600/10",
      accentText: "text-emerald-600 dark:text-emerald-400",
      switchTrack: "bg-emerald-600",
      pillGlow: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    },
    neutral: {
      borderActive: "border-stone-500",
      bgActive: "bg-stone-500/10",
      accentText: "text-stone-700 dark:text-stone-300",
      switchTrack: "bg-stone-700 dark:bg-stone-400",
      pillGlow: "shadow-[0_0_12px_rgba(120,113,108,0.3)]",
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
          "grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg border-2 transition-all shadow-2xs",
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
          <Loader2 className={cn("h-4 w-4 sm:h-5 sm:w-5 animate-spin", themeColors.accentText)} />
        ) : phase === "ready" ? (
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        ) : phase === "failed" || phase === "expired" ? (
          <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ) : (
          <span className="h-2.5 w-2.5 rounded-xs border border-transparent" />
        )}
      </span>
    );
  };

  /* ========================================================================= */
  /*                          10 DISPLAY ARCHETYPES                             */
  /* ========================================================================= */

  // 1. INVISIBLE MODE: Zero visual obstruction, auto background solving
  if (resolvedMode === "invisible") {
    return (
      <div className="hidden">
        <input type="hidden" name={name} value={payload} />
      </div>
    );
  }

  // 2. BAR MODE: Slim horizontal ribbon for inline forms & footer newsletter
  if (resolvedMode === "bar") {
    return (
      <div className={cn("flex w-full items-center justify-between gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1.5 text-xs shadow-2xs transition hover:border-[color:var(--border-strong)]", className)}>
        <input type="hidden" name={name} value={payload} />
        {phase === "ready" ? (
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">सत्यापित (Verified)</span>
            <span className="text-[10px] text-[color:var(--text-soft)] font-mono shrink-0">{mm}:{ss}</span>
          </div>
        ) : (
          <button
            type="button"
            role="checkbox"
            aria-checked={false}
            onClick={solve}
            disabled={phase === "solving"}
            className="flex items-center gap-2 font-medium text-[color:var(--text)] text-left hover:text-[#D4AF37] transition min-w-0 flex-1"
          >
            {renderControl()}
            <span className="truncate">{resolvedLabel}</span>
          </button>
        )}
        <div className="flex items-center gap-1 text-[9px] font-bold text-[#D4AF37] uppercase select-none opacity-85 shrink-0 whitespace-nowrap">
          <ShieldCheck className="h-3 w-3" />
          <span>Aalm</span>
        </div>
      </div>
    );
  }

  // 3. SLIDE TO UNLOCK / SWIPE TO VERIFY (Apple/Fintech Style)
  if (resolvedMode === "slide") {
    return (
      <div className={cn("relative w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-1 select-none transition shadow-2xs", className)}>
        <input type="hidden" name={name} value={payload} />
        <div
          role="button"
          tabIndex={0}
          onClick={phase === "ready" ? undefined : solve}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && phase !== "ready") {
              e.preventDefault();
              void solve();
            }
          }}
          className={cn(
            "relative flex h-11 w-full items-center justify-between rounded-xl px-2 transition-all cursor-pointer",
            phase === "ready"
              ? "bg-emerald-600 text-white"
              : phase === "solving"
                ? "bg-[color:var(--surface)] text-[color:var(--text-soft)]"
                : "bg-[color:var(--surface)] hover:bg-[color:var(--surface-2)] text-[color:var(--text)]",
          )}
        >
          {/* Shimmer Track Background */}
          {phase === "ready" ? (
            <div className="flex w-full items-center justify-between px-2">
              <span className="flex items-center gap-2 text-xs font-bold tracking-wide">
                <Check className="h-4 w-4 stroke-[3]" />
                सत्यापित · Verification Complete
              </span>
              <span className="text-[10px] font-mono opacity-80">{mm}:{ss}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 pl-12 text-xs font-medium text-[color:var(--text-soft)] transition">
                <ChevronsRight className="h-4 w-4 animate-pulse text-[#D4AF37]" />
                <span className="truncate">स्लाइड करें (Slide to verify)</span>
              </div>
              <span className="text-[9px] font-mono text-[color:var(--text-soft)] pr-2 opacity-70">
                {phase === "solving" ? "Verifying…" : "Slide"}
              </span>

              {/* Slider Knob */}
              <div
                className={cn(
                  "absolute left-1 top-1 bottom-1 grid w-10 place-items-center rounded-lg shadow-md transition-all duration-300",
                  phase === "solving"
                    ? "bg-[#D4AF37] text-black translate-x-28"
                    : "bg-[#D4AF37] text-black hover:scale-105 active:scale-95",
                )}
              >
                {phase === "solving" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <ChevronsRight className="h-5 w-5 stroke-[2.5]" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // 4. BIOMETRIC TOUCH & PULSE FINGERPRINT (Cyber/Luxury Fintech Style)
  if (resolvedMode === "biometric") {
    return (
      <div className={cn("w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 shadow-2xs transition hover:border-[color:var(--border-strong)]", className)}>
        <input type="hidden" name={name} value={payload} />
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={solve}
            disabled={phase === "solving" || phase === "ready"}
            className="group relative flex items-center gap-3 text-left min-w-0 flex-1 focus-visible:outline-none"
          >
            {/* Biometric Sensor Icon with Pulsing Radar Ring */}
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] transition group-hover:border-[#D4AF37]">
              {phase === "ready" ? (
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : phase === "solving" ? (
                <>
                  <span className="absolute inset-0 rounded-2xl bg-[#D4AF37]/30 animate-ping opacity-75" />
                  <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
                </>
              ) : (
                <>
                  <span className="absolute -inset-0.5 rounded-2xl bg-[#D4AF37]/15 opacity-0 group-hover:opacity-100 transition duration-300" />
                  <Fingerprint className="h-5 w-5 text-[#D4AF37] transition group-hover:scale-110" />
                </>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs sm:text-sm font-semibold text-[color:var(--text)]">
                {phase === "ready" ? "बायोमेट्रिक सत्यापित (Verified)" : resolvedLabel}
              </p>
              <p className="truncate text-[10px] text-[color:var(--text-soft)]">
                {phase === "solving"
                  ? "स्कैन हो रहा है… (Verifying PoW)"
                  : phase === "ready"
                    ? `वैधता: ${mm}:${ss} · ${Math.max(1, Math.round(elapsedMs))}ms`
                    : "टच करें या दबाए रखें (Touch to verify)"}
              </p>
            </div>
          </button>

          <div className="hidden min-[340px]:flex flex-col items-end shrink-0 pl-2 select-none border-l border-[color:var(--border)]/60">
            <span className="text-[9px] font-bold text-[#D4AF37] tracking-wider uppercase">Biometric</span>
            <span className="text-[8px] font-mono text-[color:var(--text-soft)]">Shield</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. SHAGUN / ROYAL ETHNIC SEAL (शाही मुहर — Aalm Heritage Style)
  if (resolvedMode === "shagun") {
    return (
      <div className={cn("w-full rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-r from-[color:var(--surface)] via-[color:var(--surface)] to-[#D4AF37]/5 p-2.5 shadow-2xs transition hover:border-[#D4AF37]", className)}>
        <input type="hidden" name={name} value={payload} />
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={solve}
            disabled={phase === "solving" || phase === "ready"}
            className="group flex items-center gap-3 text-left min-w-0 flex-1 focus-visible:outline-none"
          >
            {/* Royal Coin Medallion */}
            <div className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-transform duration-300 shadow-md",
              phase === "ready"
                ? "border-emerald-600 bg-emerald-600 text-white rotate-0"
                : phase === "solving"
                  ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] animate-spin"
                  : "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] group-hover:scale-105 group-hover:rotate-12",
            )}>
              {phase === "ready" ? (
                <Check className="h-5 w-5 stroke-[3]" />
              ) : phase === "solving" ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <Crown className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs sm:text-sm font-semibold text-[color:var(--text)]">
                {phase === "ready" ? "शाही मुहर प्रमाणित (Royal Seal Verified)" : "शाही मुहर (Royal Seal)"}
              </p>
              <p className="truncate text-[10px] text-[color:var(--text-soft)]">
                {phase === "solving"
                  ? "प्रमाणित किया जा रहा है…"
                  : phase === "ready"
                    ? `Aalm Vastralay · ${mm}:${ss}`
                    : "क्लिक करके मुहर लगाएं (Click to seal)"}
              </p>
            </div>
          </button>

          <div className="hidden min-[340px]:flex flex-col items-end shrink-0 pl-2 select-none border-l border-[#D4AF37]/30">
            <span className="text-[9px] font-bold text-[#D4AF37] tracking-wider uppercase">Royal Seal</span>
            <span className="text-[8px] font-mono text-[color:var(--text-soft)]">100% Shudh</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. ALTCHA OFFICIAL CRYPTOGRAPHIC SHIELD STYLE
  if (resolvedMode === "altcha") {
    return (
      <div className={cn("w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2.5 shadow-2xs transition hover:border-[color:var(--border-strong)]", className)}>
        <input type="hidden" name={name} value={payload} />
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={phase === "ready"}
            onClick={solve}
            disabled={phase === "solving" || phase === "ready"}
            className="flex flex-1 items-center gap-2.5 text-left min-w-0 focus-visible:outline-none"
          >
            {renderControl()}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs sm:text-sm font-semibold text-[color:var(--text)]">
                {phase === "ready" ? "Verified Human" : resolvedLabel}
              </span>
              <span className="block truncate text-[10px] text-[color:var(--text-soft)]">
                {phase === "solving"
                  ? "Solving Altcha challenge…"
                  : phase === "ready"
                    ? `PoW verified in ${Math.max(1, Math.round(elapsedMs))}ms · ${mm}:${ss}`
                    : "Protected by ALTCHA PoW"}
              </span>
            </span>
          </button>

          <div className="hidden min-[340px]:flex items-center gap-1.5 shrink-0 pl-2 border-l border-[color:var(--border)]/60 text-[#D4AF37]">
            <Shield className="h-4 w-4 shrink-0" />
            <div className="text-right">
              <span className="block text-[9px] font-bold tracking-wider uppercase">ALTCHA</span>
              <span className="block text-[8px] font-mono text-[color:var(--text-soft)]">Verified</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. MCAPTCHA ENTERPRISE STYLE (Speed Metric & Complexity Bar)
  if (resolvedMode === "mcaptcha") {
    return (
      <div className={cn("w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2.5 shadow-2xs transition hover:border-[color:var(--border-strong)]", className)}>
        <input type="hidden" name={name} value={payload} />
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={phase === "ready"}
            onClick={solve}
            disabled={phase === "solving" || phase === "ready"}
            className="flex flex-1 items-center gap-2.5 text-left min-w-0 focus-visible:outline-none"
          >
            {renderControl()}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs sm:text-sm font-semibold text-[color:var(--text)]">
                {phase === "ready" ? "mCaptcha Verified" : resolvedLabel}
              </span>
              <span className="block truncate text-[10px] font-mono text-[color:var(--text-soft)]">
                {phase === "solving"
                  ? "Computing SHA-256 hash…"
                  : phase === "ready"
                    ? `Speed: ~18.4 kH/s · D: 12 · ${mm}:${ss}`
                    : "mCaptcha Privacy PoW"}
              </span>
            </span>
          </button>

          <div className="hidden min-[340px]:flex items-center gap-1.5 shrink-0 pl-2 border-l border-[color:var(--border)]/60 text-[#D4AF37]">
            <Zap className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
            <div className="text-right">
              <span className="block text-[9px] font-bold tracking-wider uppercase">mCaptcha</span>
              <span className="block text-[8px] font-mono text-[color:var(--text-soft)]">Zero-Track</span>
            </div>
          </div>
        </div>

        {/* Dynamic Hash Progress Bar */}
        {phase === "solving" && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div className="h-full w-full bg-[#D4AF37] animate-[pulse_0.6s_ease-in-out_infinite]" />
          </div>
        )}
      </div>
    );
  }

  // 8. FLOATING MODE: Bottom-right pinned badge
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

  // 9. OVERLAY MODE: Security gate modal overlay
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

  // 10. TURNSTILE MODE (Default Cloudflare Turnstile Luxury Card)
  return (
    <div className={cn("w-full max-w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 sm:p-2.5 shadow-2xs transition-all hover:border-[color:var(--border-strong)]", className)}>
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
            <span className="text-[8px] sm:text-[9px] text-[color:var(--text-soft)] font-mono whitespace-nowrap">Turnstile</span>
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
                    ? failureMsg || "सुरक्षा लोड नहीं हुई, नेट चेक करके दोबारा दबाओ (Click to retry)"
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
