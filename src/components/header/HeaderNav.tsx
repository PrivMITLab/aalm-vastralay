"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LayoutDashboard, Loader2, LogOut, Menu, Moon, Package, Search, ShieldCheck, ShoppingBag, Store, Sun, UserRound, X } from "lucide-react";
import { signOut } from "@/actions/auth";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn, formatINR } from "@/lib/utils";

type Category = { name: string; slug: string; children: { name: string; slug: string }[] };
type Suggestion = { id: string; title: string; slug: string; price: number; image: string; storeName: string | null };
type HeaderUser = { fullName: string | null; email: string; role: string } | null;

/** 60-second in-memory cache so typing doesn't fire a request for every keystroke revisit. */
const suggestionCache = new Map<string, { at: number; data: Suggestion[] }>();
function cachedSuggestion(q: string): Suggestion[] | null {
  const hit = suggestionCache.get(q.toLowerCase());
  if (hit && Date.now() - hit.at < 60_000) return hit.data;
  return null;
}

export default function HeaderNav({
  categories,
  user,
  cartCount,
  wishCount,
  unread,
  brandName,
  logoText,
  logoUrl,
  logoSvg,
  showWishlist,
  showNotifications,
  showSellerHub,
  showThemeToggle,
  announcementCount,
}: {
  categories: Category[];
  user: HeaderUser;
  cartCount: number;
  wishCount: number;
  unread: number;
  brandName: string;
  logoText: string;
  logoUrl: string;
  logoSvg: boolean;
  showWishlist: boolean;
  showNotifications: boolean;
  showSellerHub: boolean;
  showThemeToggle: boolean;
  announcementCount: number;
}) {
  const router = useRouter();
  const { resolvedMode, toggleMode } = useTheme();
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced live search suggestions
  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const key = query.trim().toLowerCase();
      const warm = cachedSuggestion(key);
      if (warm) {
        setSuggestions(warm);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(key)}`, { signal: controller.signal });
        if (res.ok) {
          const json = (await res.json()) as { products: Suggestion[] };
          const data = json.products ?? [];
          suggestionCache.set(key, { at: Date.now(), data });
          if (suggestionCache.size > 200) suggestionCache.delete(suggestionCache.keys().next().value!);
          setSuggestions(data);
        }
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setSuggestions([]);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const isSeller = user?.role === "seller" || user?.role === "admin";
  const groups = useMemo(() => categories.slice(0, 6), [categories]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSuggestions([]);
    setDrawer(false);
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4">
      <div className="flex h-16 items-center gap-2 sm:gap-4">
        <button type="button" onClick={() => setDrawer(true)} className="btn btn-ghost btn-icon md:!hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${brandName} home`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-9 w-auto max-w-[9rem] object-contain" />
          ) : logoSvg ? (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--brand)] font-display text-lg text-[color:var(--accent)] shadow-inner sm:hidden">{logoText}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-full.svg" alt={brandName} className="hidden h-9 w-auto max-w-[11rem] dark:hidden sm:block" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-full-light.svg" alt={brandName} className="hidden h-9 w-auto max-w-[11rem] dark:sm:block" />
            </>
          ) : (
            <>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--brand)] font-display text-lg text-[color:var(--accent)] shadow-inner">{logoText}</span>
              <span className="hidden font-display text-lg font-semibold leading-none text-[color:var(--brand)] sm:text-xl sm:block">
                {brandName.split(" ")[0]} <span className="text-[color:var(--accent)]">{brandName.split(" ").slice(1).join(" ")}</span>
              </span>
            </>
          )}
        </Link>

        {/* search with live suggestions */}
        <div ref={boxRef} className="relative hidden flex-1 md:block">
          <form onSubmit={submit} className="flex w-full items-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] pl-4 pr-1 focus-within:border-[color:var(--accent)]">
            <Search className="h-4 w-4 text-[color:var(--text-soft)]" />
            <input
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (val.trim().length < 2) setSuggestions([]);
              }}
              type="search"
              placeholder="Try “bridal lehenga”, “banarasi saree”, “sherwani”…"
              className="h-10 w-full bg-transparent px-2.5 text-sm outline-none placeholder:text-[color:var(--text-soft)]"
              aria-label="Search products"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-[color:var(--text-soft)]" />}
            <button type="submit" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--brand)] text-white" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="absolute top-12 left-0 z-50 w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl">
              <p className="border-b border-[color:var(--border)] px-4 py-2 text-[11px] font-bold tracking-wider text-[color:var(--text-soft)] uppercase">Products</p>
              <ul>
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <Link href={`/products/${s.slug}`} onClick={() => setSuggestions([])} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--surface-2)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt="" className="h-11 w-9 rounded object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{s.title}</span>
                        <span className="block truncate text-xs text-[color:var(--text-soft)]">{s.storeName}</span>
                      </span>
                      <span className="text-sm font-semibold text-[color:var(--brand)]">{formatINR(s.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={submit} className="w-full border-t border-[color:var(--border)] px-4 py-2 text-center text-xs font-semibold text-[color:var(--brand)] hover:bg-[color:var(--surface-2)]">
                See all results for “{query}”
              </button>
            </div>
          )}
        </div>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
          {showSellerHub && (
            <Link href="/seller" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[color:var(--brand)] hover:bg-[color:var(--surface-2)] lg:flex">
              <Store className="h-4 w-4" /> {isSeller ? "Seller Hub" : "Sell"}
            </Link>
          )}

          {showThemeToggle && (
            <button type="button" onClick={toggleMode} className="btn btn-ghost btn-icon hidden sm:grid" aria-label="Toggle colour mode">
              <Sun className="hidden h-5 w-5 dark:block" />
              <Moon className="h-5 w-5 dark:hidden" />
            </button>
          )}

          {user && showNotifications && (
            <Link href="/notifications" className="relative rounded-full p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)]" aria-label="Notifications">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-[color:var(--accent-fg)]">{unread > 9 ? "9+" : unread}</span>}
            </Link>
          )}

          {showWishlist && (
            <Link href="/wishlist" className="relative rounded-full p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)]" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--brand)] px-1 text-[10px] font-bold text-white">{wishCount > 9 ? "9+" : wishCount}</span>}
            </Link>
          )}

          <Link href="/cart" className="relative rounded-full p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)]" aria-label="Bag">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--brand)] px-1 text-[10px] font-bold text-white">{cartCount > 9 ? "9+" : cartCount}</span>}
          </Link>

          {user ? (
            <details className="relative">
              <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--border-strong)] py-1 pl-1 pr-3 hover:bg-[color:var(--surface-2)]">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-[color:var(--accent-fg)]">
                  {(user.fullName ?? user.email).slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[7rem] truncate text-sm font-medium sm:block">{user.fullName?.split(" ")[0] ?? "Account"}</span>
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1.5 text-[color:var(--text)] shadow-2xl">
                <div className="border-b border-[color:var(--border)] px-3 py-2">
                  <p className="truncate text-sm font-semibold text-[color:var(--text)]">{user.fullName}</p>
                  <p className="truncate text-xs text-[color:var(--text-soft)]">{user.email}</p>
                  <span className="badge mt-1 capitalize">{user.role}</span>
                </div>
                <div className="py-1">
                  <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="My Account" />
                  <MenuLink href="/orders" icon={<Package className="h-4 w-4" />} label="My Orders" />
                  {showWishlist && <MenuLink href="/wishlist" icon={<Heart className="h-4 w-4" />} label="Wishlist" />}
                  {isSeller ? <MenuLink href="/seller" icon={<Store className="h-4 w-4" />} label="Seller Hub" /> : <MenuLink href="/onboarding" icon={<Store className="h-4 w-4" />} label="Become a Seller" />}
                  {user.role === "admin" && <MenuLink href="/admin" icon={<ShieldCheck className="h-4 w-4" />} label="Admin Panel" />}
                </div>
                <div className="border-t border-[color:var(--border)] pt-1">
                  <form action={signOut}>
                    <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-[color:var(--surface-2)]">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </form>
                </div>
              </div>
            </details>
          ) : (
            <Link href="/sign-in" className="btn btn-primary btn-sm ml-1">
              <UserRound className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </nav>
      </div>

      {/* mobile search */}
      <div className="pb-2 md:hidden">
        <form onSubmit={submit} className="flex items-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] pl-4 pr-1">
          <Search className="h-4 w-4 text-[color:var(--text-soft)]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search ethnic wear…" className="h-9 w-full bg-transparent px-2 text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-soft)]" aria-label="Search products" />
          <button type="submit" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--brand)] text-white" aria-label="Search">
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* desktop & tablet category strip */}
      <div className="hidden border-t border-[color:var(--border)] md:block">
        <div className="flex items-center gap-1 overflow-x-auto py-1.5 text-sm scrollbar-none">
          <Link href="/products" className="shrink-0 rounded-full px-3 py-1 font-medium text-[color:var(--brand)] hover:bg-[color:var(--surface-2)]">
            All Products
          </Link>
          {groups.map((c) => (
            <details key={c.slug} className="group relative">
              <summary className="shrink-0 cursor-pointer list-none rounded-full px-3 py-1 font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]">{c.name}</summary>
              {c.children.length > 0 && (
                <div className="absolute top-8 left-0 z-50 w-56 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1.5 text-[color:var(--text)] shadow-2xl">
                  {c.children.map((child) => (
                    <Link key={child.slug} href={`/products?category=${child.slug}`} className="block rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]">
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </details>
          ))}
          <Link href="/products?sort=discount" className="shrink-0 rounded-full px-3 py-1 font-semibold text-[color:var(--brand)] hover:bg-[color:var(--surface-2)]">
            Wedding Sale
          </Link>
          <Link href="/stores" className="shrink-0 rounded-full px-3 py-1 font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]">
            Stores
          </Link>
        </div>
      </div>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/45" onClick={() => setDrawer(false)} />
          <aside className="animate-slide-in absolute top-0 left-0 flex h-full w-[85vw] max-w-sm flex-col gap-3 overflow-y-auto border-r border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-[color:var(--brand)]">{brandName}</p>
              <button type="button" onClick={() => setDrawer(false)} className="btn btn-ghost btn-icon" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {user && (
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="text-xs text-[color:var(--text-soft)]">{user.email}</p>
              </div>
            )}

            <nav className="flex flex-col">
              <MobileLink href="/products" label="All products" onClick={() => setDrawer(false)} />
              {categories.map((c) => (
                <div key={c.slug}>
                  <button type="button" onClick={() => setOpenCat(openCat === c.slug ? null : c.slug)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[color:var(--surface-2)]">
                    {c.name}
                    <span className="text-[color:var(--text-soft)]">{openCat === c.slug ? "−" : "+"}</span>
                  </button>
                  {openCat === c.slug && (
                    <div className="ml-3 border-l border-[color:var(--border)] pl-2">
                      <MobileLink href={`/products?category=${c.slug}`} label={`All ${c.name}`} onClick={() => setDrawer(false)} />
                      {c.children.map((child) => (
                        <MobileLink key={child.slug} href={`/products?category=${child.slug}`} label={child.name} onClick={() => setDrawer(false)} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <MobileLink href="/stores" label="Stores" onClick={() => setDrawer(false)} />
              <MobileLink href="/orders" label="My orders" onClick={() => setDrawer(false)} />
              {showSellerHub && <MobileLink href="/seller" label="Seller hub" onClick={() => setDrawer(false)} />}
              {user?.role === "admin" && <MobileLink href="/admin" label="Admin panel" onClick={() => setDrawer(false)} />}
            </nav>

            {!user && (
              <div className="flex gap-2">
                <Link href="/sign-in" className="btn btn-primary flex-1" onClick={() => setDrawer(false)}>
                  Sign in
                </Link>
                <Link href="/sign-up" className="btn btn-outline flex-1" onClick={() => setDrawer(false)}>
                  Sign up
                </Link>
              </div>
            )}
            {announcementCount > 0 && <p className="mt-auto text-center text-[11px] text-[color:var(--text-soft)]">Zero commission · COD · 7-day returns</p>}
          </aside>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]">
      {icon} {label}
    </Link>
  );
}

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-xl px-3 py-2.5 text-sm text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]">
      {label}
    </Link>
  );
}
