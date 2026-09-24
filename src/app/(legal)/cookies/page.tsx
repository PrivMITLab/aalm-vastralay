import type { Metadata } from "next";
import { LegalLayout } from "../layout";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cookie Policy | Aalm Vastralay (आलम वस्त्रालय)",
  description:
    "Official Cookie Policy of Aalm Vastralay. Learn how we use privacy-first essential cookies and local preferences without third-party advertising tracking.",
};

export default function CookiesPage() {
  return (
    <LegalLayout slug="cookies" updated="24 September 2026">
      <div className="space-y-6">
        <section className="rounded-xl border border-maroon-100 bg-maroon-50/50 p-4 text-xs text-maroon-950 sm:text-sm">
          <p className="font-semibold text-maroon-900">
            👑 Aalm Vastralay (आलम वस्त्रालय) — Privacy-First Cookie Philosophy
          </p>
          <p className="mt-1">
            We believe you should be able to shop for bridal lehengas, silk sarees, and festive kurtas without invasive digital surveillance. We utilize cookies sparingly—strictly for session authentication, security protection, and personalized storefront preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">1. What are Cookies and Local Storage?</h2>
          <p>
            Cookies are compact cryptographic text files placed on your browser or device when you visit our website. They allow the server to recognize your device across page navigations so that you don&apos;t have to log in repeatedly, your shopping bag persists, and your selected size preferences remain saved.
          </p>
          <p>
            In addition to standard cookies, modern web applications utilize browser <b>Local Storage</b> to store shopping cart items and saved wishlist pieces directly on your device, avoiding unnecessary network calls.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">2. Comprehensive Inventory of Cookies We Use</h2>
          <p>The table below provides transparent disclosure of every cookie and storage key utilized across Aalm Vastralay:</p>
          <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[color:var(--surface-2)] text-[color:var(--text)]">
                <tr>
                  <th className="p-3 font-semibold">Cookie / Storage Key</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Duration</th>
                  <th className="p-3 font-semibold">Technical Function & Security Attributes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                <tr>
                  <td className="p-3 font-mono font-medium text-[color:var(--brand)]">av_session</td>
                  <td className="p-3 font-medium text-emerald-800">Strictly Necessary</td>
                  <td className="p-3">30 Days</td>
                  <td className="p-3">
                    HMAC-SHA256 authenticated customer and seller session token. Enforced with <code>HttpOnly</code>, <code>Secure</code>, and <code>SameSite=Lax</code> flags to prevent cross-site scripting (XSS) and CSRF attacks.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-medium text-[color:var(--brand)]">av_prefs</td>
                  <td className="p-3 font-medium text-blue-800">Functional & UX</td>
                  <td className="p-3">1 Year</td>
                  <td className="p-3">
                    Stores your visual storefront preferences: light/dark theme, text size accessibility, and reduced-motion animation settings. Contains zero personally identifiable information.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-medium text-[color:var(--brand)]">__cf_bm / pow_token</td>
                  <td className="p-3 font-medium text-purple-800">Security & Anti-Bot</td>
                  <td className="p-3">Session / 30 mins</td>
                  <td className="p-3">
                    Edge security cookie and cryptographic proof-of-work challenge token used to filter out malicious scraper bots, distributed denial-of-service (DDoS) attempts, and brute-force login attacks.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-medium text-[color:var(--brand)]">aalm_cart (Storage)</td>
                  <td className="p-3 font-medium text-emerald-800">Strictly Necessary</td>
                  <td className="p-3">Persistent (Local)</td>
                  <td className="p-3">
                    Browser localStorage container that remembers your selected sarees, lehengas, sizes, and quantities even if your internet connection disconnects briefly.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-medium text-[color:var(--brand)]">aalm_wishlist (Storage)</td>
                  <td className="p-3 font-medium text-blue-800">Functional & UX</td>
                  <td className="p-3">Persistent (Local)</td>
                  <td className="p-3">
                    Browser localStorage container preserving your saved festive and bridal outfits for future shopping sessions.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">3. What We Never Do (Strict Non-Tracking Pledge)</h2>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs sm:text-sm text-emerald-950">
            <p className="font-semibold text-emerald-900">🛡️ Zero Third-Party Advertising Trackers</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li><b>No Facebook / Meta Pixel:</b> We do not monitor your off-site browsing to target you with invasive social media ads.</li>
              <li><b>No Google Remarketing Pixels:</b> We do not track your browsing history across third-party websites.</li>
              <li><b>No Data Broker Partnerships:</b> We never sell or exchange browsing telemetry with commercial data aggregators.</li>
              <li><b>No Cross-Device Fingerprinting:</b> We do not deploy canvas fingerprinting or audio-stack profiling scripts.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">4. Managing & Disabling Cookies</h2>
          <p>
            You can control or delete cookies directly through your browser settings. Please note that disabling <b>Strictly Necessary</b> cookies (such as <code>av_session</code>) will prevent you from signing in to your account, managing orders, or completing secure checkouts.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
              <p className="font-semibold text-[color:var(--text)]">Google Chrome & Android</p>
              <p className="mt-1 text-[color:var(--text-soft)]">Settings ➔ Privacy and Security ➔ Third-party cookies ➔ Clear browsing data.</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
              <p className="font-semibold text-[color:var(--text)]">Apple Safari & iOS</p>
              <p className="mt-1 text-[color:var(--text-soft)]">Settings ➔ Safari ➔ Advanced ➔ Block All Cookies or Remove Website Data.</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
              <p className="font-semibold text-[color:var(--text)]">Mozilla Firefox</p>
              <p className="mt-1 text-[color:var(--text-soft)]">Settings ➔ Privacy & Security ➔ Enhanced Tracking Protection & Cookies.</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
              <p className="font-semibold text-[color:var(--text)]">Microsoft Edge</p>
              <p className="mt-1 text-[color:var(--text-soft)]">Settings ➔ Cookies and site permissions ➔ Manage and delete cookies.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--text)]">5. Questions & Policy Updates</h2>
          <p>
            We may revise this Cookie Policy periodically to reflect technological updates or evolving statutory guidelines. Any amendments will be reflected on this page with an updated effective timestamp.
          </p>
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 text-xs sm:text-sm">
            <p className="font-semibold text-[color:var(--brand)]">Have questions about our cookie policy?</p>
            <p className="mt-1">Reach out to our Data Protection Officer at <a href="mailto:privacy@aalmvastralay.com" className="text-[color:var(--brand)] font-semibold underline">privacy@aalmvastralay.com</a> or <a href="mailto:support@aalmvastralay.in" className="text-[color:var(--brand)] font-semibold underline">support@aalmvastralay.in</a>.</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
