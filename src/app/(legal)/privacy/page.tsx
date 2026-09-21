import type { Metadata } from "next";
import { LegalLayout } from "../layout";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalLayout slug="privacy" updated="1 January 2025">
      <p>
        Aalm Vastralay (“we”, “our”) respects your privacy. This policy describes what personal data we collect, how we use it, and the rights you have. We operate a multi-vendor
        marketplace and act as the data controller for the platform; individual sellers act as data processors for the orders they fulfil.
      </p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">1. Data we collect</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li><b>Account data</b>: name, email, mobile number, password (scrypt-hashed, never stored in plain text), profile photo.</li>
        <li><b>Order data</b>: shipping address, payment method, order history, returns & reviews.</li>
        <li><b>Seller data</b>: GSTIN (when required), bank payout reference, store content and product catalogue.</li>
        <li><b>Device data</b>: IP address, user-agent, and an HMAC-signed session identifier stored in a first-party cookie.</li>
      </ul>

      <h2 className="text-base font-semibold text-[color:var(--text)]">2. How we use data</h2>
      <p>To deliver orders, prevent fraud and abuse, provide customer support, improve the marketplace, comply with Indian law (IT Act 2000, DPDP Act 2023), and—only with your consent—send you marketing emails which you can unsubscribe from at any time.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">3. Sharing</h2>
      <p>We never sell personal data. Information is shared only with the seller fulfilling your order, the courier partner, the payment gateway, and statutory authorities when required.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">4. Payments</h2>
      <p>Card / UPI transactions are processed by RBI-authorised payment aggregators. We never see or store your full card number. Cash on Delivery orders are settled to sellers on a weekly cycle after successful delivery.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">5. Cookies</h2>
      <p>We use a single first-party session cookie, an optional preferences cookie (theme, text size, motion), and—where enabled—a privacy-friendly analytics script (Loglyuk / Plausible CE). We do not use third-party advertising cookies.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">6. Your rights</h2>
      <p>You can access, correct, export or delete your account and order data at any time from <code>/dashboard</code>, or by emailing <a href="mailto:support@aalmvastralay.in" className="text-[color:var(--brand)] underline">support@aalmvastralay.in</a>. We respond within 30 days.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">7. Security</h2>
      <p>All traffic is served over HTTPS, sessions are HttpOnly + SameSite=Lax, passwords are scrypt-hashed with a per-user salt, every privileged action is logged in an append-only audit trail, and rate limits + a self-hosted proof-of-work shield protect public forms.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">8. Contact</h2>
      <p>Data Protection Officer, Aalm Vastralay, Textile Market, Ring Road, Surat, Gujarat 395002, India.</p>
    </LegalLayout>
  );
}
