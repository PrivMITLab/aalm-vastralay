import type { Metadata } from "next";
import { LegalLayout } from "../layout";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalLayout slug="terms" updated="1 January 2025">
      <p>These Terms of Service govern your use of Aalm Vastralay. By creating an account or placing an order, you agree to the rules below.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">1. Eligibility</h2>
      <p>You must be 18 years or older and a resident of India to purchase. Sellers must provide accurate GST details where required.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">2. Pricing & payments</h2>
      <p>All listed prices are inclusive of GST unless otherwise noted. The platform accepts Cash on Delivery, UPI, debit and credit cards. Display currency is configurable from the admin panel; orders and payouts are always settled in INR.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">3. Orders</h2>
      <p>An order is accepted only after we have verified payment or confirmed COD eligibility. We may cancel orders due to stock issues, address verification failures, or suspected fraud, in which case a full refund is initiated.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">4. Returns & refunds</h2>
      <p>You may return unworn items within the return window shown at checkout. Refunds for prepaid orders are issued to the original payment method within 5–7 business days of receiving the return. COD refunds are issued via UPI/bank transfer on request.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">5. Sellers</h2>
      <p>Sellers retain 100% of order value for the first 6 months from store creation, after which a platform commission (configurable in the seller programme, currently 2.5%) is charged per delivered order. Sellers must ship within 2 business days and accept returns raised within the return window.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">6. Prohibited content</h2>
      <p>Stolen designs, counterfeit goods, hate speech, weapons, drugs, and items restricted by Indian law are not permitted. Listings violating this rule are removed and the seller may be suspended.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">7. Liability</h2>
      <p>The marketplace acts as an intermediary between buyers and sellers. To the extent permitted by Indian law, our aggregate liability is limited to the amount you paid for the affected order.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">8. Governing law</h2>
      <p>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Surat, Gujarat.</p>
    </LegalLayout>
  );
}
