import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Official Shipping & Fulfillment Policy – Aalm Vastralay",
  description: "Official shipping guidelines, courier partner SLA, transit insurance, and delivery schedules across all Indian postal zones.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/help" className="hover:text-[color:var(--brand)]">
          Help
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">Shipping Policy</span>
      </nav>

      {/* Header */}
      <header className="mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <Truck className="h-3.5 w-3.5" /> Logistics SLA
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-[color:var(--brand)]">
          Shipping & Fulfillment Terms
        </h1>
        <p className="text-xs text-[color:var(--text-soft)]">
          Last updated: March 2026 · Official fulfillment terms for Aalm Vastralay.
        </p>
      </header>

      {/* Content */}
      <div className="card space-y-6 p-6 sm:p-8 text-xs sm:text-sm leading-relaxed text-[color:var(--text-soft)] border border-[color:var(--border)]">
        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[color:var(--text)]">
            1. Fulfillment & Origin
          </h2>
          <p>
            All orders placed on the Aalm Vastralay marketplace are inspected, quality-certified, and dispatched directly from our flagship fulfillment center located at Main Road, Kalyanipur, Jamui, Bihar (811307).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[color:var(--text)]">
            2. Domestic Shipping Charges
          </h2>
          <p>
            Standard surface express shipping is <strong>100% Free</strong> on all orders with cart value above ₹999. For orders below ₹999, a nominal flat delivery charge of ₹79 is applied at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[color:var(--text)]">
            3. Delivery Lead Times
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Bihar & East India:</strong> 2 – 4 working days</li>
            <li><strong>Metro Cities (Delhi-NCR, Mumbai, Kolkata, Bengaluru, Hyderabad):</strong> 3 – 5 working days</li>
            <li><strong>Rest of India / Tier-2 & Tier-3 towns:</strong> 4 – 7 working days</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[color:var(--text)]">
            4. Damaged Package Protocol
          </h2>
          <p>
            Please do not accept any package if the tamper-proof outer security tape appears cut, resealed, or physically damaged. Immediately notify our support team or reject the delivery at the doorstep.
          </p>
        </section>

        <div className="pt-4 border-t border-[color:var(--border)] flex flex-wrap items-center justify-between gap-3">
          <Link href="/shipping" className="text-xs font-bold text-[color:var(--brand)] hover:underline">
            View Regional Timelines Table →
          </Link>
          <Link href="/track-order" className="btn-gold px-4 py-2 text-xs font-bold rounded-xl shadow-sm">
            Track Live Shipment
          </Link>
        </div>
      </div>
    </div>
  );
}
