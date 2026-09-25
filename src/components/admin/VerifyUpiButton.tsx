"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { verifyUpiPayment } from "@/actions/admin";

/**
 * Admin action button to confirm or reject UPI payments with tactile state.
 */
export default function VerifyUpiButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"verified" | "rejected" | null>(null);

  async function handleAction(action: "verify" | "reject") {
    const confirmMsg =
      action === "verify"
        ? `Are you sure you received the funds for order #${orderNumber} in your bank account?`
        : `Are you sure you want to mark order #${orderNumber} payment as rejected?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await verifyUpiPayment(orderId, action);
      if (res.ok) {
        setDone(action === "verify" ? "verified" : "rejected");
      } else {
        alert(res.message);
      }
    } catch {
      alert("Failed to update payment status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
        <Check className="h-3 w-3" /> Paid (Verified)
      </span>
    );
  }

  if (done === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
        <X className="h-3 w-3" /> Rejected
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleAction("verify")}
        className="btn btn-sm btn-primary bg-emerald-700 hover:bg-emerald-800 text-[11px] py-0.5 px-2 h-auto text-white shadow-xs tap-feedback"
        title="Verify money received in bank"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        Verify
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleAction("reject")}
        className="btn btn-sm btn-outline border-rose-300 text-rose-700 hover:bg-rose-50 text-[11px] py-0.5 px-1.5 h-auto shadow-xs tap-feedback"
        title="Reject invalid UPI UTR"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
