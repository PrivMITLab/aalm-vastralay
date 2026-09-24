import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { getBrand } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

export const revalidate = 86400;

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

/** Re-usable legal / support / company page shell with quick navigation tabs. */
export async function LegalLayout({ slug, children, updated }: { slug: LegalSlug; children: ReactNode; updated?: string }) {
  const brand = await getBrand();
  const page = PAGES[slug];

  const legalNav = [
    { slug: "privacy", label: "Privacy Policy", href: "/privacy" },
    { slug: "terms", label: "Terms of Service", href: "/terms" },
    { slug: "returns", label: "Shipping & Returns", href: "/returns" },
    { slug: "cookies", label: "Cookie Policy", href: "/cookies" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--brand)] hover:underline">
          <ChevronLeft className="h-4 w-4" /> Back to {brand.name}
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Official Statutory Policy
        </span>
      </div>

      <header className="mb-8">
        <p className="text-xs font-bold tracking-wider text-[color:var(--accent)] uppercase">{page.group}</p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[color:var(--brand)] tracking-tight">{page.title}</h1>
        {updated && (
          <p className="mt-2 text-xs font-medium text-[color:var(--text-soft)]">
            Effective Date & Last Updated: <time dateTime={updated}>{updated}</time> · Compliant with DPDP Act 2023 & Consumer Protection Rules
          </p>
        )}

        {/* Quick Legal Switcher Tabs */}
        {page.group === "legal" && (
          <nav aria-label="Legal documents navigation" className="mt-6 flex flex-wrap gap-2 border-b border-[color:var(--border)] pb-3">
            {legalNav.map((tab) => {
              const active = tab.slug === slug;
              return (
                <Link
                  key={tab.slug}
                  href={tab.href}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-[color:var(--brand)] text-[color:var(--surface)] shadow-xs"
                      : "bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--brand)] border border-[color:var(--border)]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <article className="prose-desc card space-y-6 p-6 sm:p-10 text-sm leading-relaxed text-[color:var(--text-muted)] shadow-xs rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        {children}
      </article>
    </div>
  );
}

export function formatUpdated(date: Date | string) {
  return formatDate(date);
}

export default function LegalLayoutDefault({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
