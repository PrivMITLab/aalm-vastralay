import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle, ShieldCheck, Store, Truck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Seller Handbook & Marketplace Policies – Aalm Vastralay",
  description: "Official seller onboarding handbook, dispatch standards, commission rates, and policies for Aalm Vastralay artisans.",
};

export const dynamic = "force-static";

export default function HandbookPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <BookOpen className="h-3.5 w-3.5" /> Seller Handbook &amp; Guidelines
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl text-[color:var(--brand)]">
          Aalm Vastralay Artisan Handbook
        </h1>
        <p className="mt-2 text-sm text-[color:var(--text-soft)] max-w-xl mx-auto">
          Everything Bihar and Indian weavers, boutiques, and ethnic sellers need to know to list products, fulfill orders, and receive direct payouts.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-10">
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-[color:var(--accent)] font-semibold text-sm">
            <Store className="h-4 w-4" /> 0% Commission for 6 Months
          </div>
          <h3 className="font-display text-lg font-bold text-[color:var(--brand)]">Keep 100% of Your Earnings</h3>
          <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
            All newly onboarded sellers and local weavers from Kalyanipur, Bhagalpur, Surat, and across India enjoy 0% platform commission for their first 6 months.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-[color:var(--accent)] font-semibold text-sm">
            <Truck className="h-4 w-4" /> Automated Logistics &amp; AWB
          </div>
          <h3 className="font-display text-lg font-bold text-[color:var(--brand)]">Shiprocket &amp; Delhivery Integration</h3>
          <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
            1-Click shipping label generation, door-step courier pickup, and live tracking across 26,000+ Indian pincodes.
          </p>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[color:var(--brand)] flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" /> 1. Product Photography &amp; Listing Standards
          </h2>
          <ul className="list-disc pl-5 text-sm text-[color:var(--text)] space-y-1.5 leading-relaxed">
            <li>Upload high-resolution photography on a mannequin or model with natural or studio lighting.</li>
            <li>List authentic fabric details (Pure Katan Silk, Georgette, Organza, Velvet, Chanderi).</li>
            <li>Mention precise blouse piece dimensions (e.g., 0.8m unstitched) and saree length (5.5m + 0.8m).</li>
            <li>No watermarks or competitor brand logos on listing photos (Aalm Vastralay applies automatic protection).</li>
          </ul>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[color:var(--brand)] flex items-center gap-2">
            <Truck className="h-5 w-5 text-[color:var(--accent)]" /> 2. Order Packaging &amp; Dispatch SLA
          </h2>
          <ul className="list-disc pl-5 text-sm text-[color:var(--text)] space-y-1.5 leading-relaxed">
            <li>Orders must be marked as &quot;Processing&quot; within 24 hours of customer confirmation.</li>
            <li>Pack delicate sarees and bridal lehengas in moisture-proof zip-pouches with outer corrugated boxes.</li>
            <li>Print the automated packing slip &amp; AWB barcode label from the Seller Hub (`/seller/orders`).</li>
            <li>Hand over packages to the assigned courier partner at the scheduled pickup window.</li>
          </ul>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[color:var(--brand)] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-700" /> 3. Payouts &amp; Direct Bank Settlement
          </h2>
          <ul className="list-disc pl-5 text-sm text-[color:var(--text)] space-y-1.5 leading-relaxed">
            <li>Prepaid and UPI orders are settled every Tuesday directly to your verified Indian bank account.</li>
            <li>Cash on Delivery (COD) payouts are processed 7 days post successful delivery to account for the customer return window.</li>
            <li>GST invoices are automatically generated and available for download in the Seller Portal.</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 card p-6 text-center space-y-3 bg-[color:var(--surface-2)]">
        <p className="font-display text-lg font-bold text-[color:var(--brand)]">Ready to expand your ethnic boutique?</p>
        <p className="text-xs text-[color:var(--text-soft)]">Join hundreds of master artisans and reach wedding shoppers across India.</p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/seller" className="btn btn-primary text-xs">
            Open Seller Hub
          </Link>
          <Link href="/contact" className="btn btn-outline text-xs">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
