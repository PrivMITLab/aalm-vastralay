import type { Metadata } from "next";
import { LegalLayout } from "../layout";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Shipping & Returns Policy | Aalm Vastralay (आलम वस्त्रालय)",
  description:
    "Official Shipping and Returns Policy of Aalm Vastralay. Learn about our 7-day hassle-free return window, free reverse pickup, pan-India courier delivery, and refund timelines.",
};

export default function ReturnsPage() {
  return (
    <LegalLayout slug="returns" updated="24 September 2026">
      <div className="space-y-6">
        <section className="rounded-xl border border-maroon-100 bg-maroon-50/50 p-4 text-xs text-maroon-950 sm:text-sm">
          <p className="font-semibold text-maroon-900">
            👑 Aalm Vastralay (आलम वस्त्रालय) — Royal Assurance on Every Parcel
          </p>
          <p className="mt-1">
            We want you to feel extraordinary in every silk thread and royal weave. If an ethnic garment does not fit as expected or meet your royal standards, our <b>7-Day Hassle-Free Returns & Exchange Policy</b> guarantees a smooth, zero-stress resolution with free doorstep reverse pickup across 29,000+ Indian pincodes.
          </p>
        </section>

        {/* SECTION 1: SHIPPING & DELIVERY */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">1. Pan-India Shipping & Delivery Standards</h2>
          <p>
            We partner with premier national courier logistics carriers (including <b>Delhivery, Shiprocket, and India Post Speed Post</b> for remote postal circles) to deliver royal apparel safely:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
              <p className="font-semibold text-[color:var(--brand)]">🚀 Dispatch & Handling</p>
              <p className="mt-1">Ready-to-ship ethnic garments and sarees are dispatched within <b>24 to 48 business hours</b> of order confirmation.</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
              <p className="font-semibold text-[color:var(--brand)]">⏱️ Delivery Timelines</p>
              <p className="mt-1">Metros & Tier 1 Cities: <b>2–4 business days</b>.<br />Tier 2/3 & Rural Circles: <b>4–6 business days</b>.</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
              <p className="font-semibold text-[color:var(--brand)]">🏷️ Free Shipping</p>
              <p className="mt-1">Enjoy <b>100% Free Shipping</b> on all orders above the qualifying threshold (standard ₹999) across India.</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
              <p className="font-semibold text-[color:var(--brand)]">📍 Live Parcel Tracking</p>
              <p className="mt-1">Real-time SMS, WhatsApp, and Web Push notifications are dispatched with live AWB tracking links upon courier handover.</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: CASH ON DELIVERY */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">2. Cash on Delivery (COD) Guidelines</h2>
          <p>
            Cash on Delivery is enabled across eligible pincodes. To ensure genuine artisan protection and prevent transit returns:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>COD orders may receive an automated confirmation SMS or WhatsApp prompt prior to packaging.</li>
            <li>Upon delivery, customers may pay the delivery partner via cash or scan the courier&apos;s dynamic UPI QR code (Google Pay, PhonePe, Paytm).</li>
            <li>Parcels must not be opened or tampered with before payment handover to the courier agent (per courier operating rules).</li>
          </ul>
        </section>

        {/* SECTION 3: 7-DAY RETURN POLICY */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">3. 7-Day Hassle-Free Return Policy</h2>
          <p>
            You have a statutory <b>7-day return window</b> commencing from the exact date and time your order is recorded as <i>Delivered</i> by the courier partner.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-emerald-950">
              <p className="font-semibold text-emerald-900">✅ Eligible for Return / Exchange</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Unworn, unwashed, and unperfumed garments.</li>
                <li>Items with original brand tags, barcodes, and security loops intact.</li>
                <li>Size or fit mismatch against the published size guide.</li>
                <li>Defective, damaged, or incorrect product received.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-rose-950">
              <p className="font-semibold text-rose-900">❌ Non-Returnable Items</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Custom-tailored, made-to-measure bridal lehengas or sherwanis.</li>
                <li>Sarees customized with Fall & Pico stitching (at customer request).</li>
                <li>Blouses or garments altered or stitched by external tailors.</li>
                <li>Intimate wear, nose rings, earrings, or personal hygiene accessories.</li>
                <li>Items returned without original tags, security seals, or packaging.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: UNBOXING VIDEO RECOMMENDATION */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">4. Unboxing Video Recommendation for Transit Claims</h2>
          <p>
            While every luxury parcel is sealed with tamper-evident security tape, we strongly recommend recording a continuous 360-degree <b>unboxing video</b> when receiving high-value bridal couture or heritage Banarasi silk sarees.
          </p>
          <p>
            In the rare event of transit tampering, missing components, or physical damage, sharing this video guarantees instantaneous, zero-delay claim settlement and priority replacement.
          </p>
        </section>

        {/* SECTION 5: HOW TO INITIATE A RETURN */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">5. Step-by-Step Return Process</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <b>Log in to Your Account:</b> Navigate to your orders at <code>/orders</code> and select the delivered order.
            </li>
            <li>
              <b>Submit Return Request:</b> Click <b>&quot;Request Return / Exchange&quot;</b>, select the item, reason, and upload 1–2 photos of the garment with tags attached.
            </li>
            <li>
              <b>Automated Reverse Pickup:</b> Within 24 hours of approval, our courier logistics partner is dispatched to your doorstep. Reverse pickup is <b>100% Free of Charge</b>.
            </li>
            <li>
              <b>Quality Inspection & Approval:</b> Once the returned parcel arrives at our verification hub, a royal quality check is conducted within 24 hours.
            </li>
            <li>
              <b>Instant Refund Initiation:</b> Upon quality approval, your refund or replacement is initiated immediately.
            </li>
          </ol>
        </section>

        {/* SECTION 6: REFUND TIMELINES */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">6. Refund Settlement Timelines & Modes</h2>
          <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[color:var(--surface-2)] text-[color:var(--text)]">
                <tr>
                  <th className="p-3 font-semibold">Payment Mode Used</th>
                  <th className="p-3 font-semibold">Refund Method</th>
                  <th className="p-3 font-semibold">Settlement Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Prepaid UPI / Google Pay / PhonePe</td>
                  <td className="p-3">Direct reversal to source UPI ID / Virtual Payment Address</td>
                  <td className="p-3">24 to 48 business hours</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Credit / Debit Card</td>
                  <td className="p-3">Reversal to original issuing bank card</td>
                  <td className="p-3">5 to 7 banking business days</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Net Banking</td>
                  <td className="p-3">Direct reversal to originating bank account</td>
                  <td className="p-3">3 to 5 banking business days</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Cash on Delivery (COD)</td>
                  <td className="p-3">Direct UPI transfer or NEFT/IMPS to customer-nominated bank account</td>
                  <td className="p-3">24 to 48 hours following quality inspection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 7: HELP & SUPPORT */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">7. Need Help with a Return or Size Exchange?</h2>
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 text-xs sm:text-sm">
            <p className="font-semibold text-[color:var(--brand)]">Royal Customer Care Desk</p>
            <p className="mt-1">Our dedicated Bihar & Delhi styling concierge is available Monday to Saturday, 9:00 AM – 8:00 PM IST.</p>
            <p className="mt-1">Email: <a href="mailto:support@aalmvastralay.in" className="text-[color:var(--brand)] font-semibold underline">support@aalmvastralay.in</a></p>
            <p>WhatsApp Concierge: <a href="https://wa.me/919934211100" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold underline">+91 99342 11100</a></p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
