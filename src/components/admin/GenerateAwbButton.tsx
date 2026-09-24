"use client";

import { useState, useTransition } from "react";
import { Truck, Printer, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { createOrderAwbAction, type AwbActionState } from "@/actions/courier";
import type { CourierProvider } from "@/types/courier";

interface GenerateAwbButtonProps {
  orderId: string;
  existingAwb?: string | null;
  existingCourier?: string | null;
}

export default function GenerateAwbButton({
  orderId,
  existingAwb,
  existingCourier,
}: GenerateAwbButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [provider, setProvider] = useState<CourierProvider>("auto");
  const [result, setResult] = useState<AwbActionState>(
    existingAwb
      ? {
          awbCode: existingAwb,
          courier: existingCourier || "Delhivery",
          labelUrl: `/api/courier/label?awb=${existingAwb}&courier=${existingCourier || "Delhivery"}&order=ORD`,
        }
      : null
  );

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await createOrderAwbAction(orderId, provider);
      setResult(res);
    });
  };

  if (result?.awbCode) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          {result.courier}: {result.awbCode}
        </span>
        {result.labelUrl && (
          <a
            href={result.labelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Label
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-burgundy-900 active:scale-95 transition disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating AWB…
          </>
        ) : (
          <>
            <Truck className="h-3.5 w-3.5" />
            Generate AWB ({provider === "auto" ? "Auto" : provider === "delhivery" ? "Delhivery" : "Shiprocket"})
          </>
        )}
      </button>

      <select
        value={provider}
        onChange={(e) => setProvider(e.target.value as CourierProvider)}
        disabled={isPending}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 shadow-sm focus:border-burgundy-500 focus:outline-none"
        aria-label="Select courier provider"
      >
        <option value="auto">⚡ Auto (Best Route)</option>
        <option value="delhivery">🚚 Delhivery Express</option>
        <option value="shiprocket">🚀 Shiprocket Multi-Carrier</option>
      </select>

      {result?.error && <p className="text-xs text-rose-600 ml-2">{result.error}</p>}
    </div>
  );
}
