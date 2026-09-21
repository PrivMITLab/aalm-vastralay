import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { getBrand } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGES = {
  privacy: { title: "Privacy Policy", group: "legal" },
  terms: { title: "Terms of Service", group: "legal" },
  returns: { title: "Shipping & Returns", group: "legal" },
  cookies: { title: "Cookie Policy", group: "legal" },
  contact: { title: "Contact us", group: "support" },
  about: { title: "About us", group: "company" },
} as const;
export type LegalSlug = keyof typeof PAGES;

export const metadata = {
  privacy: { title: "Privacy Policy" },
  terms: { title: "Terms of Service" },
  returns: { title: "Shipping & Returns" },
  cookies: { title: "Cookie Policy" },
  contact: { title: "Contact us" },
  about: { title: "About us" },
};

/** Re-usable legal / support / company page shell. */
export async function LegalLayout({ slug, children, updated }: { slug: LegalSlug; children: ReactNode; updated?: string }) {
  const brand = await getBrand();
  const page = PAGES[slug];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--brand)] hover:underline">
        <ChevronLeft className="h-4 w-4" /> Back to {brand.name}
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold tracking-wider text-[color:var(--accent)] uppercase">{page.group}</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[color:var(--brand)]">{page.title}</h1>
        {updated && <p className="mt-1 text-xs text-[color:var(--text-soft)]">Last updated {updated}</p>}
      </header>
      <div className="prose-desc card space-y-4 p-6 text-sm leading-relaxed text-[color:var(--text-muted)]">{children}</div>
    </div>
  );
}

export function formatUpdated(date: Date | string) {
  return formatDate(date);
}

export default function LegalLayoutDefault({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
