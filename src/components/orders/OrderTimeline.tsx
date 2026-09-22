import { Check, Clock, Package, Truck, XCircle, RotateCcw } from "lucide-react";

type OrderTimelineProps = {
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | string;
  createdAt: Date | string;
  trackingNumber?: string | null;
  courier?: string | null;
};

const STEPS = [
  { key: "pending", label: "Ordered", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

export default function OrderTimeline({ status, createdAt, trackingNumber, courier }: OrderTimelineProps) {
  const isCancelled = status === "cancelled";
  const isReturned = status === "returned";

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
        <p className="flex items-center gap-1.5 font-bold">
          <XCircle className="h-4 w-4 text-rose-600" />
          Order Cancelled
        </p>
        <p className="mt-0.5 text-[11px] text-rose-700/80 dark:text-rose-400">
          This order was cancelled and inventory has been restocked. Any online payments are refunded within 3–5 business days.
        </p>
      </div>
    );
  }

  if (isReturned) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
        <p className="flex items-center gap-1.5 font-bold">
          <RotateCcw className="h-4 w-4 text-amber-600" />
          Order Returned
        </p>
        <p className="mt-0.5 text-[11px] text-amber-700/80 dark:text-amber-400">
          Return pickup processed. Refund initiated to source account.
        </p>
      </div>
    );
  }

  const getStepIndex = (st: string) => {
    switch (st) {
      case "pending":
        return 0;
      case "confirmed":
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  const currentIdx = getStepIndex(status);

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
      <div className="flex items-center justify-between text-xs text-[color:var(--text-muted)] mb-4">
        <span>Order Status: <strong className="capitalize text-[color:var(--brand)]">{status}</strong></span>
        <span>Placed on: {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>

      {/* Stepped progress bar */}
      <div className="relative flex items-center justify-between">
        {/* Progress connecting line */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-[color:var(--surface-2)] z-0" />
        <div
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-600 transition-all duration-500 z-0"
          style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const completed = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  completed
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                    : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-soft)]"
                } ${isCurrent ? "ring-4 ring-emerald-100 dark:ring-emerald-950/50" : ""}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`mt-1.5 text-[11px] font-semibold ${
                  completed ? "text-[color:var(--brand)]" : "text-[color:var(--text-soft)]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Courier tracking detail if available */}
      {trackingNumber && (
        <div className="mt-4 rounded-lg bg-[color:var(--surface-2)] p-2.5 text-xs text-[color:var(--text)] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[color:var(--brand)]" />
            Courier: <strong>{courier || "Standard Delivery"}</strong>
          </span>
          <span className="font-mono text-[11px] text-[color:var(--text-muted)]">AWB: {trackingNumber}</span>
        </div>
      )}
    </div>
  );
}
