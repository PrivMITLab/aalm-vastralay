"use client";

import { useEffect, useState } from "react";
import {
  generateUpiUrl,
  generateUpiQrImageUrl,
  validateUtrNumber,
  formatCountdownTimer,
  playPaymentChime,
} from "@/lib/upi";
import { formatINR } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Volume2,
} from "lucide-react";

interface Props {
  amount: number;
  orderReference?: string;
  upiVpa?: string;
  merchantName?: string;
  initialSeconds?: number;
}

export default function DynamicUpiQr({
  amount,
  orderReference = "AV-CHECKOUT",
  upiVpa = "8434061342@upi",
  merchantName = "Aalm Vastralay",
  initialSeconds = 300,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const isExpired = secondsLeft <= 0;
  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState<string | null>(null);
  const [utrVerified, setUtrVerified] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Generate UPI deep link
  const upiUrl = generateUpiUrl({
    vpa: upiVpa,
    payeeName: merchantName,
    amount,
    orderNumber: orderReference,
    note: `Order ${orderReference} at Aalm Vastralay`,
  });

  const qrImageUrl = generateUpiQrImageUrl(upiUrl, 280);

  // Countdown timer effect
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  function handleReset() {
    setSecondsLeft(initialSeconds);
  }

  function handleCopyVpa() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(upiVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2500);
    }
  }

  function handleVerifyUtr() {
    const val = validateUtrNumber(utr);
    if (!val.isValid) {
      setUtrError(val.error ?? "Invalid UTR");
      setUtrVerified(false);
      return;
    }
    setUtrError(null);
    setUtrVerified(true);
    playPaymentChime();
  }

  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / initialSeconds) * 100));

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/60 to-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
            <QrCode className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Instant Dynamic UPI QR</h3>
            <p className="text-[11px] text-slate-500">₹0 Gateway Fees · GPay, PhonePe, Paytm, BHIM</p>
          </div>
        </div>

        {/* 5-Minute Timer Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-900">
          <Clock className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
          <span>{formatCountdownTimer(secondsLeft)}</span>
        </div>
      </div>

      {/* Progress countdown bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
        <div
          className={`h-full transition-all duration-1000 ${
            secondsLeft < 60 ? "bg-rose-500" : secondsLeft < 120 ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main QR Display */}
      <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start">
        <div className="relative flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3 shadow-inner">
          {isExpired ? (
            <div className="flex h-[200px] w-[200px] flex-col items-center justify-center p-4 text-center">
              <p className="text-sm font-semibold text-rose-600">QR Code Expired</p>
              <p className="mt-1 text-xs text-slate-500">Security timeout reached</p>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline btn-sm mt-3 flex items-center gap-1 text-xs"
              >
                <RefreshCw className="h-3 w-3" /> Regenerate QR
              </button>
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt="Scan to Pay via UPI"
                className="h-[200px] w-[200px] rounded-lg object-contain"
              />
              <span className="mt-2 text-xs font-bold text-slate-800">
                Amount: {formatINR(amount)}
              </span>
            </>
          )}
        </div>

        {/* UPI Details & 1-Click App Launches */}
        <div className="flex-1 space-y-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-[11px] font-medium text-slate-500">Pay to Verified Merchant:</p>
            <p className="text-sm font-bold text-slate-900">{merchantName}</p>
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-700">
              <span>{upiVpa}</span>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="flex items-center gap-1 text-xs font-medium text-maroon-700 hover:underline"
              >
                <Copy className="h-3 w-3" /> {copiedVpa ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Quick Pay on Mobile Button */}
          <div className="sm:hidden">
            <a
              href={upiUrl}
              className="btn btn-primary flex w-full items-center justify-center gap-2 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in UPI App (GPay / PhonePe)
            </a>
          </div>

          {/* UTR Verification Input */}
          <div className="rounded-xl border border-cream-300 bg-white p-3">
            <label htmlFor="upiUtrInput" className="block text-xs font-semibold text-slate-800">
              Enter 12-digit UTR / UPI Ref No. after payment:
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="upiUtrInput"
                type="text"
                maxLength={12}
                placeholder="e.g. 423456789012"
                value={utr}
                onChange={(e) => {
                  setUtr(e.target.value.replace(/\D/g, ""));
                  setUtrError(null);
                }}
                className="input input-sm flex-1 font-mono text-xs uppercase tracking-wider"
              />
              <button
                type="button"
                onClick={handleVerifyUtr}
                className={`btn btn-sm ${
                  utrVerified ? "btn-secondary text-emerald-800" : "btn-gold"
                }`}
              >
                {utrVerified ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Attached
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Volume2 className="h-3.5 w-3.5" /> Verify
                  </span>
                )}
              </button>
            </div>

            {utrError && <p className="mt-1 text-[11px] font-medium text-rose-600">{utrError}</p>}
            {utrVerified && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> UTR Verified & attached to your order!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden input passed to form action */}
      <input type="hidden" name="upiUtr" value={utr} />

      {/* Safety Notice */}
      <div className="mt-3 flex items-center justify-center gap-1 text-center text-[10px] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>Direct bank transfer via NPCI Unified Payments Interface. ₹0 extra gateway surcharge.</span>
      </div>
    </div>
  );
}
