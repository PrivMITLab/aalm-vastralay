"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Challenge = {
  algorithm: string;
  challenge: string;
  salt: string;
  iterations: number;
  maxnumber: number;
  zeros: number;
  expires: number;
  signature: string;
};

/**
 * Shared Web Worker source for brute-forcing the PoW puzzle off the main
 * thread. Exported for reuse by ClickToSolve — keep parameters in sync with
 * lib/pow.ts (PBKDF2/SHA-256, salt `${salt}?${n}`, 256-bit output).
 */
export const WORKER_SOURCE = `
self.onmessage = async (e) => {
  const { challenge, salt, iterations, zeros, maxnumber } = e.data;
  const enc = new TextEncoder();
  const prefix = "0".repeat(zeros);
  try {
    const key = await crypto.subtle.importKey("raw", enc.encode(challenge), "PBKDF2", false, ["deriveBits"]);
    for (let n = 0; n <= maxnumber; n++) {
      const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: enc.encode(salt + "?" + n), iterations, hash: "SHA-256" },
        key,
        256,
      );
      const bytes = new Uint8Array(bits);
      let hex = "";
      for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
      if (hex.startsWith(prefix)) { self.postMessage({ number: n }); return; }
    }
    self.postMessage({ number: -1 });
  } catch (err) { self.postMessage({ number: -1, error: String(err) }); }
};
`;

/** Main-thread fallback solver used when Web Workers are unavailable. */
export async function solveOnMainThread(c: Challenge) {
  const enc = new TextEncoder();
  const prefix = "0".repeat(c.zeros);
  const key = await crypto.subtle.importKey("raw", enc.encode(c.challenge), "PBKDF2", false, ["deriveBits"]);
  for (let n = 0; n <= c.maxnumber; n++) {
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(`${c.salt}?${n}`), iterations: c.iterations, hash: "SHA-256" }, key, 256);
    const bytes = new Uint8Array(bits);
    let hex = "";
    for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
    if (hex.startsWith(prefix)) return n;
  }
  return -1;
}

/**
 * Invisible proof-of-work shield.
 * Solves a signed hash puzzle issued by /api/security/challenge and submits the
 * solution with the form. Blocks scripted spam/replay without any third-party captcha.
 * Pass `action` to bind the token to one form (server enforces the binding).
 */
export default function BotShield({ label = "Spam & bot protection", action }: { label?: string; action?: string }) {
  const [state, setState] = useState<"idle" | "solving" | "ready" | "disabled" | "failed">("idle");
  const [payload, setPayload] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    let worker: Worker | null = null;

    async function run() {
      try {
        const qs = action ? `?action=${encodeURIComponent(action)}` : "";
        const res = await fetch(`/api/security/challenge${qs}`, { cache: "no-store" });
        if (!res.ok) throw new Error("challenge failed");
        const json = (await res.json()) as { enabled: boolean; challenge: Challenge };
        if (cancelled) return;
        if (!json.enabled) {
          setState("disabled");
          return;
        }
        setState("solving");
        const c = json.challenge;

        let number = -1;
        try {
          const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
          const url = URL.createObjectURL(blob);
          worker = new Worker(url);
          number = await new Promise<number>((resolve) => {
            const timeout = setTimeout(() => resolve(-1), 20000);
            worker!.onmessage = (e: MessageEvent<{ number: number }>) => {
              clearTimeout(timeout);
              resolve(e.data.number);
            };
            worker!.onerror = () => {
              clearTimeout(timeout);
              resolve(-1);
            };
            worker!.postMessage(c);
          });
          URL.revokeObjectURL(url);
        } catch {
          number = -1;
        }
        if (number < 0) number = await solveOnMainThread(c);
        if (cancelled) return;
        if (number < 0) {
          setState("failed");
          return;
        }
        setPayload(JSON.stringify({ challenge: c, solution: { algorithm: c.algorithm, challenge: c.challenge, salt: c.salt, number, signature: c.signature, zeros: c.zeros } }));
        setElapsed(Date.now() - startedAt);
        setState("ready");
      } catch {
        if (!cancelled) setState("failed");
      }
    }

    run();
    return () => {
      cancelled = true;
      worker?.terminate();
    };
  }, [startedAt, action]);

  if (state === "disabled") return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
      <input ref={inputRef} type="hidden" name="botPayload" value={payload} />
      {state === "ready" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : state === "failed" ? <ShieldCheck className="h-4 w-4 text-amber-600" /> : <Loader2 className="h-4 w-4 animate-spin" />}
      <span className={cn("flex-1", state === "failed" && "text-amber-700")}>
        {state === "ready" && `${label} verified in ${Math.max(1, Math.round(elapsed))} ms · proof-of-work solved`}
        {state === "solving" && `${label}: solving a small hash puzzle (no captcha needed)…`}
        {state === "idle" && `${label}: preparing…`}
        {state === "failed" && (
          <span className="flex items-center justify-between w-full">
            <span>Suraksha load nahi hui, net check karke dobara dabao.</span>
            <button
              type="button"
              onClick={() => {
                setState("idle");
              }}
              className="ml-2 font-bold underline hover:text-amber-800"
            >
              Retry
            </button>
          </span>
        )}
      </span>
      <span className="hidden font-mono text-[10px] opacity-70 sm:inline">{state === "ready" ? payload.length > 0 && "PBKDF2/SHA-256" : ""}</span>
    </div>
  );
}
