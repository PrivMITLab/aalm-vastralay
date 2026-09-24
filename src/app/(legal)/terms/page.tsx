import type { Metadata } from "next";
import { LegalLayout } from "../layout";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Service | Aalm Vastralay (आलम वस्त्रालय)",
  description:
    "Official Terms of Service of Aalm Vastralay. Learn about our marketplace rules, authentic ethnic apparel policies, and consumer protection terms.",
};

export default function TermsPage() {
  return (
    <LegalLayout slug="terms" updated="24 September 2026">
      <div className="space-y-6">
        <section className="rounded-xl border border-maroon-100 bg-maroon-50/50 p-4 text-xs text-maroon-950 sm:text-sm">
          <p className="font-semibold text-maroon-900">
            👑 Aalm Vastralay (आलम वस्त्रालय) — Marketplace Terms & Conditions
          </p>
          <p className="mt-1">
            Welcome to Aalm Vastralay. These Terms of Service constitute a legally binding electronic agreement between you (“User”, “Buyer”, or “Seller”) and Aalm Vastralay (“Platform”, “we”, “our”), headquartered in <b>Kalyanipur, Bihar 848302, India</b>, executed in accordance with the <b>Information Technology Act, 2000</b> and the <b>Consumer Protection (E-Commerce) Rules, 2020</b>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">1. Acceptance of Terms & Eligibility</h2>
          <p>
            By accessing our website, creating an account, browsing our ethnic collections, or placing an order, you confirm that:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>You are at least 18 years of age and legally competent to enter into binding contracts under the Indian Contract Act, 1872.</li>
            <li>All personal registration information submitted by you is true, current, and accurate.</li>
            <li>You agree to abide by all applicable Indian e-commerce, tax, and cyber laws.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">2. Marketplace Intermediary Framework (Section 79 IT Act)</h2>
          <p>
            Aalm Vastralay operates as an online marketplace intermediary connecting independent verified ethnic boutiques, master weavers, and bridal ateliers with consumers across India:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Intermediary Status:</b> Under Section 79 of the Information Technology Act, 2000, Aalm Vastralay provides an electronic platform for listing and discovering ethnic fashion products. The contract of sale for specific seller listings is entered directly between the respective Seller and the Buyer.
            </li>
            <li>
              <b>Due Diligence:</b> We perform statutory KYC, GSTIN verification, and quality curation before onboarding sellers. Any merchant found listing counterfeit, infringing, or substandard merchandise is terminated immediately.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">3. Handloom, Silk & Artisanal Weave Authenticity Disclaimer</h2>
          <p>
            Authentic Indian ethnic wear, handwoven sarees, Zardozi lehengas, and silk garments are crafted through traditional artisan methods:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Artisanal Character:</b> Slight irregularities in weave patterns, natural slubs in raw silk, minor color variation between dye lots, and handcrafted Zari embellishments are authentic hallmarks of genuine handlooms and do not constitute manufacturing defects.
            </li>
            <li>
              <b>Display Colors:</b> We strive to render accurate photographic colors; however, subtle color differences may occur due to individual screen calibration, lighting temperatures, and camera sensors.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">4. Pricing, GST Taxes & Statutory Invoicing</h2>
          <p>
            All commercial transactions on Aalm Vastralay are transparent and fully statutory:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>GST Inclusion:</b> All retail product prices displayed on the storefront are inclusive of Goods and Services Tax (GST) at statutory rates (5% on apparel up to statutory thresholds, 12% above, and 3% on precious adornments).
            </li>
            <li>
              <b>Statutory Tax Invoice (Rule 46 CGST Rules, 2017):</b> Every delivered order is accompanied by a downloadable, print-ready A4 Tax Invoice indicating the Seller/Platform GSTIN, HSN Code (e.g., HSN 5007 for Sarees, HSN 6204 for Lehengas, HSN 6203 for Sherwanis), taxable value, and CGST/SGST/IGST tax breakdowns.
            </li>
            <li>
              <b>Currency:</b> All billing, checkout transactions, and refunds are settled strictly in Indian Rupees (₹ / INR).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">5. Payments & Cash on Delivery (COD) Rules</h2>
          <p>We provide versatile, secure payment options for all Indian regions:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Prepaid Modes:</b> Dynamic UPI QR, Google Pay, PhonePe, Paytm, RuPay/Visa/MasterCard Debit & Credit Cards, and Net Banking processed through RBI-regulated payment aggregators.
            </li>
            <li>
              <b>Cash on Delivery (COD):</b> Available for serviceable pincodes across India. To prevent spurious bookings that harm artisan weaving clusters:
              <ul className="list-circle space-y-1 pl-5 mt-1 text-xs">
                <li>Orders may undergo automated telephonic or OTP confirmation before dispatch.</li>
                <li>Repeated rejection of verified COD parcels at doorstep will result in COD suspension for that account.</li>
                <li>Doorstep digital payment via dynamic UPI QR is supported on delivery.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">6. Order Acceptance, Dispatch & Cancellation</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Acceptance:</b> Order confirmation is generated upon payment clearance or COD verification.
            </li>
            <li>
              <b>Dispatch SLA:</b> Readymade apparel ships within 24–48 business hours. Made-to-measure bridal orders follow agreed bespoke tailoring schedules.
            </li>
            <li>
              <b>Customer Cancellation:</b> Orders can be cancelled free of charge prior to handover to courier dispatch from your Customer Orders page (<code>/orders</code>). Once dispatched, cancellation must follow our Returns Policy.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">7. Seller Obligations & Commission Policy</h2>
          <p>Merchants onboarded onto Aalm Vastralay agree to high marketplace benchmarks:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Introductory Commission Waiver:</b> Eligible new sellers enjoy 0% commission for the initial introductory period (standard 6 months), after which nominal platform service commissions (2.0% – 3.0%) apply per delivered order.
            </li>
            <li>
              <b>Dispatch Reliability:</b> Sellers must hand over verified orders to assigned courier logistics partners within 2 business days.
            </li>
            <li>
              <b>Authenticity Warranty:</b> Sellers warrant that all items listed are genuine, unadulterated, and free from intellectual property infringement.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">8. Prohibited Activities & Security</h2>
          <p>Users must not engage in any of the following unauthorized activities:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Reverse-engineering, automated data scraping, or harvesting catalog listings without express written permission.</li>
            <li>Attempting SQL injection, cryptographic tampering, rate-limit bypassing, or denial-of-service (DDoS) attacks.</li>
            <li>Posting defamatory, fraudulent, or infringing customer reviews or UGC content.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permissible under applicable Indian law, Aalm Vastralay&apos;s aggregate liability for any direct claims arising out of an order shall be strictly limited to the total monetary amount received by the Platform for that specific order. We shall not be liable for indirect, incidental, or consequential losses.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">10. Governing Law & Dispute Resolution</h2>
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 text-xs sm:text-sm">
            <p className="font-semibold text-[color:var(--brand)]">Jurisdiction & Legal Recourse</p>
            <p className="mt-1">
              These Terms shall be interpreted and governed exclusively by the laws of the Republic of India. Any disputes, controversies, or claims arising out of or relating to these Terms or orders placed on the Platform shall be subject to the exclusive jurisdiction of the competent courts in <b>District Samastipur / High Court of Judicature at Patna, Bihar, India</b>.
            </p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
