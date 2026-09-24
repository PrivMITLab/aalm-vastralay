import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy – Aalm Vastralay",
  description: "Read our comprehensive refund, cancellation, and exchange terms for handcrafted ethnic wear and bridal couture.",
};

export default function RefundPolicyPage() {
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
        <span className="font-semibold text-[color:var(--text)]">Refund Policy</span>
      </nav>

      {/* Header */}
      <header className="mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <RefreshCw className="h-3.5 w-3.5" /> Buyer Protection
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-[color:var(--brand)]">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-[color:var(--text-soft)]">
          Last updated: March 2026 · Compliant with Consumer Protection (E-Commerce) Rules, India.
        </p>
      </header>

      {/* Policy Content */}
      <div className="card space-y-6 p-6 sm:p-8 text-xs sm:text-sm leading-relaxed text-[color:var(--text-soft)] border border-[color:var(--border)]">
        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[color:var(--text)]">
            1. 7-Day Hassle-Free Returns
          </h2>
          <p>
            We take supreme pride in the craftsmanship of our ethnic apparel. If you are not completely satisfied with your ready-to-ship saree, lehenga, or kurta, you may initiate a return within 7 calendar days of delivery.
          </p>
          <p>
            The garment must be unworn, unwashed, unaltered, and retained with all original tags, authenticity cards, and luxury packaging intact.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[color:var(--text)]">
            2. Custom Stitching & Bridal Alterations Non-Returnable
          </h2>
          <p>
            Any outfit tailored or stitched to bespoke customer measurements (such as custom blouse tailoring, lehenga waist adjustments, or custom length alterations) cannot be returned or refunded once stitching has commenced.
          </p>
          <p>
            However, we provide complimentary re-fitting adjustments if the garment does not match the measurements agreed upon during consultation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[color:var(--text)]">
            3. Refund Timelines & Processing Method
          </h2>
          <p>
            Once our Kalyanipur quality control team inspects and verifies the returned package:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Prepaid Orders (UPI / Cards / Net Banking):</strong> Refund is initiated immediately and credited to the original source account within 5 to 7 business days.</li>
            <li><strong>Cash on Delivery (COD):</strong> Refund is processed via direct UPI transfer or NEFT to your verified bank account within 3 business days.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[color:var(--text)]">
            4. Cancellation Window
          </h2>
          <p>
            Standard orders can be cancelled within 4 hours of placement without any cancellation penalty. Once dispatched or once bridal cutting begins, orders cannot be cancelled mid-transit.
          </p>
        </section>

        <div className="pt-4 border-t border-[color:var(--border)] flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[color:var(--text-soft)]">
            Questions regarding an active return? Contact support@aalmvastralay.com
          </p>
          <Link href="/returns" className="btn-gold px-4 py-2 text-xs font-bold rounded-xl shadow-sm">
            Read Returns Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
