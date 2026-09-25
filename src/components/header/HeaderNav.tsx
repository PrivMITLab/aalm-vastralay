"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Flame,
  Heart,
  HelpCircle,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Package,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  Truck,
  UserRound,
  X,
} from "lucide-react";
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
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-2.5 sm:px-4">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-1.5 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="btn btn-ghost btn-icon md:!hidden text-[color:var(--brand)] hover:bg-[color:var(--surface-2)]"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Master Brand Identity Logo (Visible in both Light & Dark Mode) */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90" aria-label={`${brandName} Home`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-10 w-auto max-w-[10rem] object-contain" />
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Royal Gold + Purple Medallion Icon */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4A148C] via-[#38006b] to-[#120024] p-0.5 shadow-md ring-1 ring-[#D4AF37]/60">
                <span className="font-serif text-base font-extrabold tracking-tight text-[#D4AF37]">
                  {logoText || "AV"}
                </span>
                <span className="absolute inset-0 rounded-full border border-[#D4AF37]/30" />
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col">
                <span className="font-display text-lg sm:text-xl font-bold tracking-wide leading-none text-[color:var(--brand)]">
                  AALM <span className="font-serif text-[#D4AF37] drop-shadow-xs">VASTRALAY</span>
                </span>
                <span className="hidden sm:block text-[9px] font-semibold tracking-[0.22em] text-[color:var(--text-soft)] uppercase mt-0.5">
                  Wedding &amp; Ethnic Wear · Kalyanipur
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Desktop Search Bar with Live Suggestions */}
        <div ref={boxRef} className="relative hidden flex-1 md:block max-w-2xl mx-auto">
          <form
            onSubmit={submit}
            className="flex w-full items-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] pl-4 pr-1 focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]/20 transition-all"
          >
            <Search className="h-4 w-4 text-[color:var(--text-soft)]" />
            <input
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (val.trim().length < 2) setSuggestions([]);
              }}
              type="search"
              placeholder="Try “bridal lehenga”, “banarasi saree”, “sherwani”, “kurta”…"
              className="h-10 w-full bg-transparent px-2.5 text-sm outline-none placeholder:text-[color:var(--text-soft)] text-[color:var(--text)]"
              aria-label="Search products"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-[color:var(--text-soft)] mr-1" />}
            <button
              type="submit"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--brand)] text-white hover:opacity-90 transition-opacity"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="absolute top-12 left-0 z-50 w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl">
              <p className="border-b border-[color:var(--border)] px-4 py-2 text-[11px] font-bold tracking-wider text-[color:var(--text-soft)] uppercase">
                Matching Ethnic Wear
              </p>
              <ul>
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/products/${s.slug}`}
                      onClick={() => setSuggestions([])}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--surface-2)] transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt="" className="h-11 w-9 rounded object-cover border border-[color:var(--border)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[color:var(--text)]">{s.title}</span>
                        <span className="block truncate text-xs text-[color:var(--text-soft)]">{s.storeName}</span>
                      </span>
                      <span className="text-sm font-semibold text-[color:var(--brand)]">{formatINR(s.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={submit}
                className="w-full border-t border-[color:var(--border)] px-4 py-2 text-center text-xs font-semibold text-[color:var(--brand)] hover:bg-[color:var(--surface-2)]"
              >
                See all results for “{query}” →
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {showSellerHub && (
            <Link
              href="/seller"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[color:var(--brand)] hover:bg-[color:var(--surface-2)] border border-[color:var(--border)] lg:flex"
            >
              <Store className="h-3.5 w-3.5 text-[color:var(--accent)]" /> {isSeller ? "Seller Hub" : "Sell on Aalm"}
            </Link>
          )}

          {showThemeToggle && (
            <button
              type="button"
              onClick={toggleMode}
              className="btn btn-ghost btn-icon hidden sm:inline-flex"
              aria-label="Toggle light or dark color mode"
            >
              <Sun className="hidden h-5 w-5 dark:block text-amber-400" />
              <Moon className="h-5 w-5 dark:hidden text-slate-700" />
            </button>
          )}

          {user && showNotifications && (
            <Link
              href="/notifications"
              className="relative rounded-full p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)]"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-[color:var(--accent-fg)]">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}

          {showWishlist && (
            <Link
              href="/wishlist"
              className="relative rounded-full p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)]"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--brand)] px-1 text-[10px] font-bold text-white">
                  {wishCount > 9 ? "9+" : wishCount}
                </span>
              )}
            </Link>
          )}

          <Link
            href="/cart"
            className="relative rounded-full p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)]"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--brand)] px-1 text-[10px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <details className="relative">
              <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--border-strong)] py-1 pl-1 pr-3 hover:bg-[color:var(--surface-2)]">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-[color:var(--accent-fg)]">
                  {(user.fullName ?? user.email).slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[7rem] truncate text-sm font-medium sm:block text-[color:var(--text)]">
                  {user.fullName?.split(" ")[0] ?? "Account"}
                </span>
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
                  {isSeller ? (
                    <MenuLink href="/seller" icon={<Store className="h-4 w-4" />} label="Seller Hub" />
                  ) : (
                    <MenuLink href="/onboarding" icon={<Store className="h-4 w-4" />} label="Become a Seller" />
                  )}
                  {user.role === "admin" && (
                    <MenuLink href="/admin" icon={<ShieldCheck className="h-4 w-4" />} label="Admin Panel" />
                  )}
                </div>
                <div className="border-t border-[color:var(--border)] pt-1">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-[color:var(--surface-2)]"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </form>
                </div>
              </div>
            </details>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="btn btn-primary btn-sm ml-1 text-xs hidden sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/sign-in"
                className="btn btn-ghost btn-icon sm:hidden text-[color:var(--text-muted)]"
                aria-label="Sign in"
                title="Sign in"
              >
                <UserRound className="h-5 w-5" />
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Search Input */}
      <div className="pb-2 md:hidden">
        <form
          onSubmit={submit}
          className="flex items-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] pl-3.5 pr-1 focus-within:border-[color:var(--accent)]"
        >
          <Search className="h-3.5 w-3.5 text-[color:var(--text-soft)] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search sarees, lehengas, kurtas…"
            className="h-8 sm:h-9 w-full bg-transparent px-2 text-xs sm:text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-soft)]"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="grid h-6.5 w-6.5 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-full bg-[color:var(--brand)] text-white hover:opacity-90"
            aria-label="Search"
          >
            <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </form>
      </div>

      {/* Desktop Category Navigation Strip */}
      <div className="hidden border-t border-[color:var(--border)] md:block">
        <div className="no-scrollbar flex snap-x items-center gap-1 overflow-x-auto py-1.5 text-[13px]">
          <Link
            href="/products"
            className="shrink-0 snap-start min-h-[44px] inline-flex items-center rounded-full px-3 py-1 font-semibold text-[color:var(--brand)] underline decoration-[#D4AF37] decoration-2 underline-offset-4 hover:bg-[color:var(--surface-2)]"
          >
            All Products
          </Link>
          {groups.map((c) => (
            <details key={c.slug} className="group relative shrink-0 snap-start">
              <summary className="shrink-0 cursor-pointer list-none rounded-full px-3 py-1 min-h-[44px] inline-flex items-center font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]">
                {c.name}
              </summary>
              {c.children.length > 0 && (
                <div className="absolute top-8 left-0 z-50 w-56 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1.5 text-[color:var(--text)] shadow-2xl">
                  {c.children.map((child) => (
                    <Link
                      key={child.slug}
                      href={`/products?category=${child.slug}`}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </details>
          ))}
          <Link
            href="/products?sort=discount"
            className="shrink-0 rounded-full px-3 py-1 font-semibold text-amber-600 dark:text-amber-400 hover:bg-[color:var(--surface-2)] flex items-center gap-1"
          >
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Wedding Sale
          </Link>
          <Link
            href="/stores"
            className="shrink-0 rounded-full px-3 py-1 font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]"
          >
            Stores &amp; Artisans
          </Link>
        </div>
      </div>

      {/* 👑 ELITE FULL-HEIGHT MOBILE DRAWER (Fixed Slide-over) */}
      {drawer && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDrawer(false)}
            aria-hidden="true"
          />

          {/* Sliding Panel */}
          <aside className="animate-slide-left fixed inset-y-0 left-0 flex h-full w-[min(88vw,360px)] flex-col bg-[color:var(--surface)] text-[color:var(--text)] shadow-2xl border-r border-[color:var(--border)] z-[101] overflow-y-auto">
            {/* Royal Header */}
            <div className="relative bg-gradient-to-br from-[#4A148C] via-[#38006b] to-[#1a0033] p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#38006b] border border-[#D4AF37] shadow-md">
                    <span className="font-serif text-lg font-bold text-[#D4AF37]">{logoText || "AV"}</span>
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold tracking-wide text-white">
                      आलम वस्त्रालय
                    </h2>
                    <p className="text-[10px] font-medium tracking-widest text-[#D4AF37] uppercase">
                      Aalm Vastralay · Kalyanipur
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Bar in Drawer */}
              {user ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 p-2.5 backdrop-blur-sm border border-white/15">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#D4AF37] text-xs font-bold text-slate-950">
                    {(user.fullName ?? user.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{user.fullName || "Account"}</p>
                    <p className="truncate text-[10px] text-white/70">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/40 uppercase">
                    {user.role}
                  </span>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setDrawer(false)}
                    className="btn btn-gold py-1.5 text-xs text-center justify-center font-bold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setDrawer(false)}
                    className="btn py-1.5 text-xs text-center justify-center border border-white/40 bg-white/10 text-white hover:bg-white/20"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 border-b border-[color:var(--border)] bg-[color:var(--surface-2)] text-center text-xs">
              <Link
                href="/products?sort=discount"
                onClick={() => setDrawer(false)}
                className="flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-[color:var(--surface)] text-amber-600 dark:text-amber-400 font-semibold"
              >
                <Flame className="h-4 w-4" />
                <span>Wedding Sale</span>
              </Link>
              <Link
                href="/track-order"
                onClick={() => setDrawer(false)}
                className="flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-[color:var(--surface)] text-[color:var(--brand)] font-semibold"
              >
                <Truck className="h-4 w-4" />
                <span>Track Order</span>
              </Link>
              <Link
                href="/orders"
                onClick={() => setDrawer(false)}
                className="flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-[color:var(--surface)] text-[color:var(--text)] font-semibold"
              >
                <Package className="h-4 w-4" />
                <span>My Orders</span>
              </Link>
            </div>

            {/* Main Menu Links & Categories */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {/* Category Taxonomies */}
              <div>
                <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-[color:var(--accent)] mb-1">
                  Shop Ethnic Collections
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/products"
                    onClick={() => setDrawer(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-[color:var(--brand)] hover:bg-[color:var(--surface-2)]"
                  >
                    <span>Browse All Collections</span>
                    <ChevronRight className="h-4 w-4 text-[color:var(--text-soft)]" />
                  </Link>

                  {categories.map((c) => (
                    <div key={c.slug}>
                      <button
                        type="button"
                        onClick={() => setOpenCat(openCat === c.slug ? null : c.slug)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-[color:var(--text)] hover:bg-[color:var(--surface-2)]"
                      >
                        <span>{c.name}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-[color:var(--text-soft)] transition-transform duration-200",
                            openCat === c.slug && "rotate-180 text-[color:var(--brand)]",
                          )}
                        />
                      </button>

                      {openCat === c.slug && (
                        <div className="ml-3 my-1 space-y-1 border-l-2 border-[color:var(--accent)]/40 pl-3">
                          <Link
                            href={`/products?category=${c.slug}`}
                            onClick={() => setDrawer(false)}
                            className="block rounded-lg px-2 py-1.5 text-xs font-semibold text-[color:var(--brand)] hover:bg-[color:var(--surface-2)]"
                          >
                            All {c.name} →
                          </Link>
                          {c.children.map((child) => (
                            <Link
                              key={child.slug}
                              href={`/products?category=${child.slug}`}
                              onClick={() => setDrawer(false)}
                              className="block rounded-lg px-2 py-1.5 text-xs text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)]"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketplace Links */}
              <div>
                <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-[color:var(--accent)] mb-1">
                  Marketplace &amp; Sellers
                </p>
                <div className="space-y-0.5 text-sm">
                  <Link
                    href="/stores"
                    onClick={() => setDrawer(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[color:var(--text)] hover:bg-[color:var(--surface-2)]"
                  >
                    <Store className="h-4 w-4 text-[color:var(--accent)]" />
                    <span>Explore Boutiques &amp; Stores</span>
                  </Link>

                  {isSeller ? (
                    <Link
                      href="/seller"
                      onClick={() => setDrawer(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[color:var(--brand)] font-semibold hover:bg-[color:var(--surface-2)]"
                    >
                      <Store className="h-4 w-4 text-[color:var(--accent)]" />
                      <span>Seller Portal Hub</span>
                    </Link>
                  ) : (
                    <Link
                      href="/onboarding"
                      onClick={() => setDrawer(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[color:var(--text)] hover:bg-[color:var(--surface-2)]"
                    >
                      <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
                      <span>Sell with 0% Commission</span>
                    </Link>
                  )}

                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setDrawer(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-purple-700 dark:text-purple-400 font-bold hover:bg-[color:var(--surface-2)]"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Management Console</span>
                    </Link>
                  )}

                  <Link
                    href="/handbook"
                    onClick={() => setDrawer(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[color:var(--text)] hover:bg-[color:var(--surface-2)]"
                  >
                    <HelpCircle className="h-4 w-4 text-[color:var(--accent)]" />
                    <span>Seller Handbook &amp; Standards</span>
                  </Link>
                </div>
              </div>

              {/* Direct WhatsApp Consultation Button */}
              <div className="pt-1">
                <a
                  href="https://wa.me/918434061342?text=Namaste%20Aalm%20Vastralay,%20I%20would%20like%20to%20consult%20for%20bridal/wedding%20wear%20and%20sarees."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1fb855] transition-all"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>WhatsApp Bridal Consultation</span>
                </a>
                <p className="mt-1 text-center text-[10px] text-[color:var(--text-soft)]">
                  Call Proprietor: +91 8434061342 (Kalyanipur)
                </p>
              </div>

              {/* Theme & Support */}
              <div className="border-t border-[color:var(--border)] pt-3 flex items-center justify-between text-xs text-[color:var(--text-soft)]">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[color:var(--surface-2)]"
                >
                  {resolvedMode === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                  <span>{resolvedMode === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <Link href="/contact" onClick={() => setDrawer(false)} className="hover:text-[color:var(--brand)]">
                  Help &amp; Support
                </Link>
              </div>
            </div>

            {/* Footer Trust Guarantees */}
            <div className="border-t border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 text-center text-[11px] font-medium text-[color:var(--text-soft)]">
              ✨ 100% Authentic Handloom · Free Shipping &gt; ₹999 · COD
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--brand)] active:scale-[0.97] active:bg-[color:var(--surface-3)] transition-all tap-feedback select-none"
    >
      {icon} {label}
    </Link>
  );
}
