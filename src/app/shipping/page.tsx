import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy – Aalm Vastralay",
  description: "Learn about our pan-India delivery timelines, courier partners, free shipping rules, and tamper-proof bridal packaging at Aalm Vastralay.",
};

const ZONES = [
  {
    zone: "Bihar & Neighbouring States",
    timeline: "2 – 4 Business Days",
    desc: "Direct express dispatch from our Kalyanipur central hub.",
  },
  {
    zone: "Tier-1 Metro Cities",
    timeline: "3 – 5 Business Days",
    desc: "Delhi-NCR, Mumbai, Kolkata, Bengaluru, Hyderabad, Chennai.",
  },
  {
    zone: "Rest of India & Rural Pin Codes",
    timeline: "5 – 7 Business Days",
    desc: "Comprehensive reach via India Post and surface express logistics.",
  },
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
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
      <header className="mb-10 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <Truck className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Pan-India Logistics
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-[color:var(--brand)]">
          Shipping & Delivery Guidelines
        </h1>
        <p className="text-sm text-[color:var(--text-soft)] max-w-xl mx-auto">
          Delivering heritage Banarasi weaves, bridal couture, and ethnic garments securely to your doorstep across 19,000+ Indian postal codes.
        </p>
      </header>

      {/* Core Highlights */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <div className="card p-5 border border-[color:var(--border)] space-y-2 text-center">
          <Truck className="h-6 w-6 text-[color:var(--brand)] mx-auto" />
          <h2 className="text-sm font-bold text-[color:var(--text)]">Free Shipping</h2>
          <p className="text-xs text-[color:var(--text-soft)]">
            Complimentary delivery on all prepaid and COD orders over ₹999 across India.
          </p>
        </div>
        <div className="card p-5 border border-[color:var(--border)] space-y-2 text-center">
          <PackageCheck className="h-6 w-6 text-[color:var(--accent)] mx-auto" />
          <h2 className="text-sm font-bold text-[color:var(--text)]">Tamper-Proof Box</h2>
          <p className="text-xs text-[color:var(--text-soft)]">
            Luxury bridal boxes with moisture-lock wrapping and security seals.
          </p>
        </div>
        <div className="card p-5 border border-[color:var(--border)] space-y-2 text-center">
          <ShieldCheck className="h-6 w-6 text-emerald-600 mx-auto" />
          <h2 className="text-sm font-bold text-[color:var(--text)]">100% Insured Transit</h2>
          <p className="text-xs text-[color:var(--text-soft)]">
            Every shipment is fully insured against theft, loss, or transit damage.
          </p>
        </div>
      </div>

      {/* Delivery Zones Table */}
      <section className="mb-10 space-y-4">
        <h2 className="font-display text-xl font-bold text-[color:var(--brand)] flex items-center gap-2">
          <Clock className="h-5 w-5 text-[color:var(--accent)]" /> Delivery Timelines by Region
        </h2>
        <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[color:var(--surface-2)] text-[color:var(--text)] uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-3.5">Destination Zone</th>
                <th className="p-3.5">Estimated Delivery</th>
                <th className="p-3.5">Coverage Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {ZONES.map((z, idx) => (
                <tr key={idx} className="hover:bg-[color:var(--surface-2)]/50">
                  <td className="p-3.5 font-semibold text-[color:var(--text)]">{z.zone}</td>
                  <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-bold">{z.timeline}</td>
                  <td className="p-3.5 text-[color:var(--text-soft)]">{z.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Policies List */}
      <div className="space-y-6">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-3">
          <h3 className="text-sm font-bold text-[color:var(--text)] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[color:var(--accent)]" /> Cash on Delivery (COD) Rules
          </h3>
          <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
            COD is available for orders up to ₹15,000. For orders exceeding ₹15,000 (such as heavy bridal lehengas or pure zari silk sarees), secure prepaid payment via UPI, Credit/Debit card, or Net Banking is required to prevent fraudulent refusals during transit.
          </p>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-3">
          <h3 className="text-sm font-bold text-[color:var(--text)] flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[color:var(--accent)]" /> Order Dispatch & Notifications
          </h3>
          <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
            Orders are processed and dispatched within 24–48 hours from our Kalyanipur flagship warehouse. You will receive real-time SMS and WhatsApp notifications containing your tracking link (AWB) the moment your package is scanned by our logistics partners (Delhivery, BlueDart, DTDC).
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-6">
        <div>
          <h4 className="text-sm font-bold text-[color:var(--brand)]">Already placed an order?</h4>
          <p className="text-xs text-[color:var(--text-soft)]">Check real-time milestone progress right now.</p>
        </div>
        <Link href="/track-order" className="btn-gold px-5 py-2.5 text-xs font-bold rounded-xl shadow-md">
          Track Your Order
        </Link>
      </div>
    </div>
  );
}
