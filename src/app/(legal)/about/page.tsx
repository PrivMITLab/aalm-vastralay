import type { Metadata } from "next";
import { LegalLayout } from "../layout";
import { getBrand, getSettingNumber, getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "About us" };

export default async function AboutPage() {
  const [brand, settings, freeMonths] = await Promise.all([getBrand(), getSettings(), getSettingNumber("seller.freeMonths", 6)]);
  return (
    <LegalLayout slug="about" updated="1 January 2025">
      <p>
        {brand.name} is a zero-commission marketplace built for India’s wedding and ethnic-wear economy. Every seller on the platform is a real boutique, weaver
        collective or designer – we don’t allow resellers of mass-produced goods.
      </p>
      <p>
        Sellers keep 100% of every sale for their first {freeMonths} months (then just {settings["seller.commissionPercent"]}% per delivered order), there are
        no listing fees, and shoppers pay nothing extra for Cash on Delivery or 7-day returns.
      </p>
      <h2 className="text-base font-semibold text-[color:var(--text)]">How we pay for it</h2>
      <p>
        The platform costs ₹0 to run on permanent free-tier infrastructure – Neon PostgreSQL, Cloudflare Pages, ImageKit, Backblaze B2, a Cloudflare Worker, quiet-mail and a
        self-hosted proof-of-work shield. When you scale beyond the free quotas, the architecture is portable: swap any single piece for a self-hosted equivalent
        without rewriting the others.
      </p>
      <h2 className="text-base font-semibold text-[color:var(--text)]">Mission</h2>
      <p>Make India’s wedding wear ecosystem fair, transparent, and online-first – one boutique at a time.</p>
    </LegalLayout>
  );
}
