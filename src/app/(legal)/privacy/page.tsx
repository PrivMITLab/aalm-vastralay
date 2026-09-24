import type { Metadata } from "next";
import { LegalLayout } from "../layout";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy | Aalm Vastralay (आलम वस्त्रालय)",
  description:
    "Official Privacy Policy of Aalm Vastralay. Learn how we safeguard your personal data under the Digital Personal Data Protection Act, 2023 (DPDP Act) and IT Act 2000.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout slug="privacy" updated="24 September 2026">
      <div className="space-y-6">
        <section className="rounded-xl border border-maroon-100 bg-maroon-50/50 p-4 text-xs text-maroon-950 sm:text-sm">
          <p className="font-semibold text-maroon-900">
            👑 Aalm Vastralay (आलम वस्त्रालय) — Trust & Privacy Commitment
          </p>
          <p className="mt-1">
            We are dedicated to safeguarding the personal dignity, confidentiality, and data autonomy of every customer, bride, groom, weaver, and artisan visiting our ethnic marketplace. We process personal data strictly in adherence to the <b>Digital Personal Data Protection Act, 2023 (DPDP Act)</b>, the <b>Information Technology Act, 2000</b>, and the <b>Consumer Protection (E-Commerce) Rules, 2020</b>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">1. Who We Are & Governance Scope</h2>
          <p>
            Aalm Vastralay (“we”, “us”, “our”, or “Platform”) operates an authentic Indian ethnic wear, bridal couture, silk saree, and handloom marketplace headquartered in <b>Kalyanipur, Bihar 848302, India</b>.
          </p>
          <p>
            For the purposes of Indian data protection laws:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Data Fiduciary / Controller:</b> Aalm Vastralay determines the purpose and means of processing personal data on the Platform.
            </li>
            <li>
              <b>Data Processors:</b> Independent verified sellers, artisan weaving clusters, payment aggregators, and national logistics partners (e.g., Delhivery, Shiprocket) act as data processors bound by strict confidentiality and contractual data protection covenants.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">2. Categories of Personal Data We Collect</h2>
          <p>We only collect data necessary to provide authentic ethnic garments, custom bridal tailoring, and safe order fulfillment:</p>
          <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[color:var(--surface-2)] text-[color:var(--text)]">
                <tr>
                  <th className="p-3 font-semibold">Data Category</th>
                  <th className="p-3 font-semibold">Specific Data Points</th>
                  <th className="p-3 font-semibold">Purpose & Lawful Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Identity & Account</td>
                  <td className="p-3">Full name, email address, mobile number, scrypt-hashed password credentials, avatar image.</td>
                  <td className="p-3">Account creation, authentication, anti-fraud verification, and DPDP consent management.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Order & Delivery</td>
                  <td className="p-3">Shipping address, city, state, postal pincode, recipient telephone number, delivery landmark.</td>
                  <td className="p-3">Order dispatch, courier routing, doorstep delivery, and Cash on Delivery (COD) serviceability.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Bespoke Fitting & Sizing</td>
                  <td className="p-3">Garment sizes (e.g., S, M, L, XL), blouse measurements, custom tailoring notes, bridal fitting consult notes.</td>
                  <td className="p-3">Precision tailoring and artisan stitching coordination (explicit customer request).</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Payment & Invoicing</td>
                  <td className="p-3">Payment method, transaction references, 12-digit UPI UTR numbers, statutory GST tax invoices.</td>
                  <td className="p-3">Statutory tax compliance (Rule 46 CGST Rules, 2017) and RBI-compliant financial reconciliation.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Seller & Artisan KYC</td>
                  <td className="p-3">Business name, 15-digit GSTIN, bank payout IFSC/account, workshop address, contact representative.</td>
                  <td className="p-3">Statutory vendor verification, Section 79 intermediary diligence, and marketplace payout settlements.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[color:var(--text)]">Technical & Security</td>
                  <td className="p-3">IP address, user-agent string, device fingerprint, session cookie, proof-of-work challenge solutions.</td>
                  <td className="p-3">Automated bot defense, DDoS prevention, rate limiting, and brute-force account shielding.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">3. Lawful Grounds for Processing</h2>
          <p>Under Section 4 and Section 7 of the DPDP Act 2023, we process personal data solely under the following valid legal grounds:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><b>Explicit Consent:</b> Provided when registering an account, submitting product reviews, or opting in to promotional announcements.</li>
            <li><b>Performance of Contract:</b> Necessary to process and deliver your order, issue dispatch updates, and coordinate returns/refunds.</li>
            <li><b>Statutory Obligation:</b> Compliance with the Central Goods and Services Tax Act, 2017 (issuing statutory GST tax invoices and retaining audit ledgers for 8 years).</li>
            <li><b>Legitimate Uses & Fraud Prevention:</b> Shielding customer accounts from unauthorized credential stuffing, bot spam, and payment chargeback frauds.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">4. Seller Multi-Vendor Privacy & PII Isolation</h2>
          <p>
            As a multi-vendor marketplace, we enforce strict zero-leakage data scoping across all boutique partners and artisans:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><b>Masked Contact Feeds:</b> Sellers only receive the customer&apos;s shipping name and delivery address necessary to pack the parcel. Sensitive personal details are protected from unsolicited marketing.</li>
            <li><b>Isolated Catalog & Order Boundaries:</b> Individual sellers can never view, export, or access another boutique&apos;s customer orders, financial ledgers, or customer reviews.</li>
            <li><b>Intermediary Neutrality:</b> Sellers are contractually barred from contacting buyers outside the platform for off-marketplace transactions.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">5. Payment Security & RBI Compliance</h2>
          <p>
            Your financial data is protected by the highest banking-grade standards in India:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>We <b>never store or log your credit card number, CVV, or net banking passwords</b> on our servers.</li>
            <li>All electronic card and UPI transactions are routed through RBI-authorized Payment Aggregators using 256-bit TLS encryption.</li>
            <li>For Cash on Delivery (COD), order verification is conducted via SMS/OTP or WhatsApp before dispatch to protect artisans from bogus bookings.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">6. Data Sharing & Third-Party Processors</h2>
          <p className="font-semibold text-emerald-800">
            We do NOT sell, lease, or monetize your personal data to third-party advertising brokers or data brokers under any circumstances.
          </p>
          <p>We share data exclusively with authorized infrastructure partners:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><b>Logistics Partners (Delhivery, Shiprocket):</b> Name, address, phone number, and weight for generating shipping airway bills (AWB).</li>
            <li><b>Cloud Infrastructure:</b> Neon Serverless PostgreSQL hosted securely in AWS Mumbai (`ap-south-1`) region with pooled connection encryption.</li>
            <li><b>Transactional Messaging:</b> Google Apps Script mailer engine for zero-domain password reset OTP delivery and status updates.</li>
            <li><b>Statutory Authorities:</b> When mandated by a valid judicial or statutory order under Indian law.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">7. Enterprise Data Security & Encryption</h2>
          <p>We apply defense-in-depth engineering practices to secure your data:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><b>Encryption at Rest:</b> Sensitive customer fields are secured with military-grade <code>AES-256-GCM</code> authenticated encryption.</li>
            <li><b>Encryption in Transit:</b> 100% of network traffic is enforced over TLS 1.3 with HSTS (HTTP Strict Transport Security).</li>
            <li><b>Credential Protection:</b> Passwords are scrypt-hashed with randomized per-user cryptographic salts.</li>
            <li><b>Tamper-Proof Audit Trails:</b> Administrative actions and order modifications are permanently logged in an append-only audit trail.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">8. Your Rights as a Data Principal (DPDP Act, 2023)</h2>
          <p>As a valued patron of Aalm Vastralay, you hold complete statutory rights regarding your personal information:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><b>Right to Access:</b> Review your profile data, addresses, and order history directly in your Customer Dashboard (<code>/dashboard</code>).</li>
            <li><b>Right to Correction:</b> Update out-of-date addresses, phone numbers, or account details at any time.</li>
            <li><b>Right to Erasure / Account Deletion:</b> Request permanent account deletion by contacting our Data Protection Officer (subject to statutory tax retention rules under CGST Act).</li>
            <li><b>Right of Grievance Redressal:</b> Direct access to our designated Grievance Officer for prompt dispute resolution.</li>
            <li><b>Right to Nominate:</b> Nominate an authorized representative to exercise your data rights in the event of unforeseen incapacitation.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">9. Statutory Grievance Redressal Officer</h2>
          <p>
            In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Consumer Protection (E-Commerce) Rules, 2020, our appointed Grievance Officer details are published below:
          </p>
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 text-xs sm:text-sm">
            <p className="font-semibold text-[color:var(--brand)]">Grievance Redressal Officer</p>
            <p className="mt-1 font-medium">Aalm Vastralay Customer Protection Cell</p>
            <p>Physical Address: Main Market, Kalyanipur, District Samastipur, Bihar – 848302, India</p>
            <p>Official Email: <a href="mailto:grievance@aalmvastralay.com" className="text-[color:var(--brand)] font-semibold underline">grievance@aalmvastralay.com</a></p>
            <p>Support Desk: <a href="mailto:support@aalmvastralay.in" className="text-[color:var(--brand)] font-semibold underline">support@aalmvastralay.in</a></p>
            <p className="mt-2 text-xs text-[color:var(--text-soft)]">
              ⏱️ <b>Response SLA:</b> Acknowledgment within 48 hours; complete resolution within 15 business days.
            </p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
