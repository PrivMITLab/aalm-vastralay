"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, MapPin, Truck, AlertCircle, Zap, ShieldCheck } from "lucide-react";
import { lookupPincode, type PincodeInfo } from "@/lib/pincode";

export default function PincodeEstimator() {
  const [pincode, setPincode] = useState("");
  const [info, setInfo] = useState<PincodeInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("av_pincode");
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        const res = lookupPincode(saved);
        if (res) setInfo(res);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      setInfo(null);
      return;
    }

    const res = lookupPincode(clean);
    if (!res) {
      setError("Unable to verify PIN code serviceability. Please try another PIN.");
      setInfo(null);
      return;
    }

    setInfo(res);
    setError("");
    try {
      localStorage.setItem("av_pincode", clean);
    } catch {
      // LocalStorage access may be restricted
    }
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--brand)]">
          <MapPin className="h-4 w-4 text-[color:var(--accent-fg)]" />
          Delivery &amp; Serviceability
        </div>
        {info && (
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            Serviceable
          </span>
        )}
      </div>

      <form onSubmit={handleCheck} className="mt-2.5 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              if (error) setError("");
            }}
            placeholder="Enter 6-digit PIN code (e.g. 226001)"
            className="input w-full py-1.5 text-xs font-medium"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary py-1.5 px-3.5 text-xs font-semibold"
        >
          Check
        </button>
      </form>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {info && !error && (
        <div className="mt-3 space-y-2 border-t border-[color:var(--border)]/60 pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--text-muted)]">
              <MapPin className="h-3 w-3 text-rose-500" />
              {info.circle} ({info.state})
            </span>
            {info.isExpressAvailable && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                <Zap className="h-2.5 w-2.5 fill-current" /> Express Hub
              </span>
            )}
          </div>

          <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
            <Truck className="h-4 w-4 shrink-0 text-emerald-600" />
            Expected delivery by:{" "}
            <strong className="text-[color:var(--brand)]">{info.deliveryRange}</strong>
          </p>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px] text-[color:var(--text-muted)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              Cash on Delivery (₹0 extra)
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              Dispatched within 24h
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600" />
              7-Day easy exchange
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              Free shipping over ₹{info.freeShippingThreshold}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
