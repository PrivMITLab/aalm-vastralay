import Link from "next/link";
import { Mail, MapPin, Phone, RotateCcw, Truck, Wallet } from "lucide-react";
import { BrandIcon } from "./ui/SocialIcons";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getBrand, getCommerce, getSettingBool, getSettingNumber } from "@/lib/settings";
import Newsletter from "./ui/Newsletter";

export default async function Footer() {
  const [brand, commerce, freeMonths, wishlist] = await Promise.all([
    getBrand(),
    getCommerce(),
    getSettingNumber("seller.freeMonths", 6),
    getSettingBool("features.wishlist", true),
  ]);
  const cats = await db
    .select()
    .from(categories)
    .where(and(eq(categories.isActive, true), isNull(categories.parentId)))
    .orderBy(asc(categories.sortOrder))
    .catch(() => []);

  const perks = [
    { title: `${freeMonths} months 0% commission`, text: "Sellers keep 100% – then just 2–3% per order.", icon: <Wallet className="h-5 w-5" /> },
    { title: "Cash on Delivery", text: "Pay at your doorstep, or via UPI, cards & net banking.", icon: <Truck className="h-5 w-5" /> },
    { title: `${commerce.returnWindowDays}-day easy returns`, text: "No-questions-asked returns on every order.", icon: <RotateCcw className="h-5 w-5" /> },
    { title: "Verified sellers only", text: "GST-checked boutiques, weaver collectives & designers.", icon: <MapPin className="h-5 w-5" /> },
  ];

  return (
    <footer className="no-print mt-16 w-full max-w-full min-w-0 overflow-x-clip border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto grid w-full max-w-7xl min-w-0 max-w-full grid-cols-1 gap-5 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        {perks.map((p) => (
          <div key={p.title} className="flex min-w-0 gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand)]">{p.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold">{p.title}</p>
              <p className="break-words text-xs text-[color:var(--text-soft)]">{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[color:var(--border)] bg-[color:var(--surface-2)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:px-8 py-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--brand)] font-display text-lg text-[color:var(--accent)]">{brand.logoText}</span>
              <p className="font-display text-xl font-semibold text-[color:var(--brand)]">{brand.name}</p>
            </div>
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">{brand.tagline}</p>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--text-muted)]">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" /> <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="hover:text-[color:var(--brand)]">{brand.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" /> <a href={`mailto:${brand.email}`} className="hover:text-[color:var(--brand)]">{brand.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> <span>{brand.address}</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              {brand.social.instagram && (
                <a href={brand.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-[color:var(--border-strong)] p-2 text-[color:var(--text-muted)] hover:text-[color:var(--brand)]">
                  <BrandIcon name="instagram" />
                </a>
              )}
              {brand.social.youtube && (
                <a href={brand.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="rounded-full border border-[color:var(--border-strong)] p-2 text-[color:var(--text-muted)] hover:text-[color:var(--brand)]">
                  <BrandIcon name="youtube" />
                </a>
              )}
              {brand.social.facebook && (
                <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-[color:var(--border-strong)] p-2 text-[color:var(--text-muted)] hover:text-[color:var(--brand)]">
                  <BrandIcon name="facebook" />
                </a>
              )}
            </div>
          </div>

          <FooterCol title="Shop" links={(cats.length ? cats : []).map((c) => [c.name, `/products?category=${c.slug}`] as [string, string]).concat([["Wedding Sale", "/products?sort=discount"], ["All Products", "/products"]])} />
          <FooterCol
            title="Sell & explore"
            links={[
              ["Become a Seller", "/onboarding"],
              ["Seller Hub", "/seller"],
              ["All Stores", "/stores"],
              ["Seller handbook", "/handbook"],
            ]}
          />
          <div className="lg:pr-6">
            <p className="mb-3 text-xs font-bold tracking-wider text-[color:var(--brand)] uppercase">Account</p>
            <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
              <li><Link href="/orders" className="hover:text-[color:var(--brand)]">My Orders</Link></li>
              {wishlist && <li><Link href="/wishlist" className="hover:text-[color:var(--brand)]">Wishlist</Link></li>}
              <li><Link href="/dashboard" className="hover:text-[color:var(--brand)]">My Account</Link></li>
              <li><Link href="/handbook" className="hover:text-[color:var(--brand)]">Help & policies</Link></li>
              <li><Link href="/sign-in" className="hover:text-[color:var(--brand)]">Sign in</Link></li>
              <li><Link href="/contact" className="hover:text-[color:var(--brand)]">Contact</Link></li>
              <li><Link href="/about" className="hover:text-[color:var(--brand)]">About</Link></li>
            </ul>
            <p className="mt-4 text-xs font-bold tracking-wider text-[color:var(--brand)] uppercase">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
              <li><Link href="/privacy" className="hover:text-[color:var(--brand)]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[color:var(--brand)]">Terms of Service</Link></li>
              <li><Link href="/returns" className="hover:text-[color:var(--brand)]">Shipping & Returns</Link></li>
              <li><Link href="/cookies" className="hover:text-[color:var(--brand)]">Cookie Policy</Link></li>
            </ul>
            <div className="mt-5">
              <Newsletter />
            </div>
          </div>
        </div>

        <div className="border-t border-[color:var(--border)] px-4 py-4">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <p className="text-center text-xs text-[color:var(--text-soft)]">
                © {new Date().getFullYear()} {brand.name}. {brand.copyright}
              </p>
              <span className="hidden sm:inline text-xs text-[color:var(--text-soft)]/50">·</span>
              <span className="text-[10px] font-mono text-[color:var(--text-soft)]/60" title="Deploy build version. Hard reload: Ctrl+Shift+R">
                Build: {process.env.NEXT_PUBLIC_BUILD_ID || "v2.6-prod"}
              </span>
            </div>
            <p className="text-center text-xs text-[color:var(--text-soft)]">UPI · Cards · Net banking · Cash on Delivery · Prices {commerce.gstInclusive ? "incl." : "excl."} GST</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold tracking-wider text-[color:var(--brand)] uppercase">{title}</p>
      <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
        {links.map(([label, href]) => (
          <li key={`${label}-${href}`}>
            <Link href={href} className="hover:text-[color:var(--brand)]">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
