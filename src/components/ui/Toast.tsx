"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; variant: "success" | "error" | "info" };
type Ctx = { push: (t: Omit<Toast, "id">) => void; success: (title: string, description?: string) => void; error: (title: string, description?: string) => void; info: (title: string, description?: string) => void };

const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      push,
      success: (title, description) => push({ title, description, variant: "success" }),
      error: (title, description) => push({ title, description, variant: "error" }),
      info: (title, description) => push({ title, description, variant: "info" }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-24 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-slide-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-3 shadow-xl backdrop-blur",
              t.variant === "success" && "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
              t.variant === "error" && "border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
              t.variant === "info" && "border-cream-200 bg-white/95 text-slate-900",
            )}
          >
            <span className="mt-0.5">
              {t.variant === "success" ? <CheckCircle2 className="h-5 w-5" /> : t.variant === "error" ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            </span>
            <div className="flex-1 text-sm">
              <p className="font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 opacity-90">{t.description}</p>}
            </div>
            <button type="button" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} aria-label="Dismiss" className="rounded-full p-1 hover:bg-black/5">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
