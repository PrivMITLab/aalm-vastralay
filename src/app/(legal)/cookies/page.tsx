import type { Metadata } from "next";
import { LegalLayout } from "../layout";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <LegalLayout slug="cookies" updated="1 January 2025">
      <p>We use cookies sparingly – only the ones we actually need to run the marketplace and keep you signed in. You can clear or disable cookies in your browser at any time; parts of the site that require them (sign-in, cart, checkout) will simply ask you to sign in again.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">What we set</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li><b>av_session</b>: HttpOnly, SameSite=Lax session token – required to keep you signed in.</li>
        <li><b>av_prefs</b>: theme (light/dark/system), text size, motion, layout density – purely local convenience, no tracking.</li>
        <li><b>__cf_bm</b> / Cloudflare security cookie – set automatically by our edge to detect bots; not used for advertising.</li>
        <li><b>Analytics</b>: if enabled, a privacy-friendly analytics script (Loglyuk / Plausible CE) records anonymous pageviews.</li>
      </ul>

      <h2 className="text-base font-semibold text-[color:var(--text)]">What we never set</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>No third-party advertising cookies.</li>
        <li>No Facebook, TikTok, or Google Ads tracking pixels.</li>
        <li>No fingerprinting or cross-site identifiers.</li>
      </ul>
    </LegalLayout>
  );
}
