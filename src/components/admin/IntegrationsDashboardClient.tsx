"use client";

import React, { useState } from "react";
import { CheckCircle2, CircleDashed, ExternalLink, Loader2, Play, AlertCircle } from "lucide-react";
import type { IntegrationTestService } from "@/app/api/admin/integrations/test/route";

interface ServiceItem {
  name: string;
  purpose: string;
  envKeys: string[];
  docs: string;
  configured: boolean;
  testKey?: IntegrationTestService;
}

export default function IntegrationsDashboardClient({ services }: { services: ServiceItem[] }) {
  const [testingService, setTestingService] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean; message?: string; error?: string }>>({});

  const handleTest = async (svc: ServiceItem) => {
    if (!svc.testKey) return;
    setTestingService(svc.name);
    setResults((prev) => ({ ...prev, [svc.name]: undefined as unknown as { success: boolean } }));

    try {
      const res = await fetch("/api/admin/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: svc.testKey }),
      });

      const data = (await res.json()) as { success: boolean; message?: string; error?: string };
      setResults((prev) => ({
        ...prev,
        [svc.name]: {
          success: Boolean(data.success),
          message: data.message,
          error: data.error,
        },
      }));
    } catch (err: unknown) {
      setResults((prev) => ({
        ...prev,
        [svc.name]: {
          success: false,
          error: err instanceof Error ? err.message : "Test network call failed",
        },
      }));
    } finally {
      setTestingService(null);
    }
  };

  return (
    <ul className="divide-y divide-[color:var(--border)]">
      {services.map((s) => {
        const isTesting = testingService === s.name;
        const result = results[s.name];

        return (
          <li key={s.name} className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className={`mt-0.5 ${s.configured ? "text-emerald-600 dark:text-emerald-400" : "text-[color:var(--text-soft)]"}`}>
                  {s.configured ? <CheckCircle2 className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-stone-100">{s.name}</p>
                    <span
                      className={`badge text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        s.configured
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                      }`}
                    >
                      {s.configured ? "Active" : "Awaiting key"}
                    </span>
                  </div>
                  <p className="text-xs text-[color:var(--text-soft)] mt-0.5">
                    {s.purpose}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-stone-400">Keys:</span>
                    {s.envKeys.map((k) => (
                      <code
                        key={k}
                        className="rounded bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 font-mono text-[10px] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                      >
                        {k}
                      </code>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {s.testKey && (
                  <button
                    type="button"
                    onClick={() => void handleTest(s)}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-slate-700 dark:text-stone-200 hover:border-maroon-600 hover:text-maroon-700 dark:hover:border-gold-400 dark:hover:text-gold-300 transition-all shadow-2xs active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-maroon-700 dark:text-gold-400" />
                        <span>Testing…</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>
                )}

                <a
                  href={s.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip text-xs inline-flex items-center gap-1"
                >
                  Docs <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Test Connection Output Alert */}
            {result && (
              <div
                className={`mt-2 flex items-start gap-2 rounded-xl p-3 text-xs animate-fade-in ${
                  result.success
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{result.success ? "Live Connection Verified" : "Connection Error"}</p>
                  <p className="mt-0.5">{result.success ? result.message : result.error}</p>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
