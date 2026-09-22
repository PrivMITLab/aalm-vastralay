"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, MapPin, Truck, AlertCircle } from "lucide-react";

export default function PincodeEstimator() {
  const [pincode, setPincode] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("av_pincode");
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        calculateDelivery(saved);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function calculateDelivery(code: string) {
    // Delivery estimated between 3 to 5 business days from today
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() + 3));
    const end = new Date(now.setDate(now.getDate() + 2));

    const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
    setDeliveryDate(`${start.toLocaleDateString("en-IN", options)} – ${end.toLocaleDateString("en-IN", options)}`);
    setChecked(true);
    setError("");
    localStorage.setItem("av_pincode", code);
  }

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      setChecked(false);
      return;
    }
    calculateDelivery(clean);
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--brand)]">
        <MapPin className="h-4 w-4 text-[color:var(--accent-fg)]" />
        Delivery & Serviceability
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
            placeholder="Enter 6-digit PIN code"
            className="input w-full py-1.5 text-xs"
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
        <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      {checked && !error && (
        <div className="mt-3 space-y-1.5 text-xs border-t border-[color:var(--border)]/60 pt-3">
          <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
            <Truck className="h-4 w-4" />
            Expected delivery by: <strong className="text-[color:var(--brand)]">{deliveryDate}</strong>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[color:var(--text-muted)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Cash on Delivery available
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Express courier shipping
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              7-day easy exchange/return
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
