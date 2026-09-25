import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingBar from "@/components/ui/FloatingBar";
import MobileTabBar from "@/components/ui/MobileTabBar";
import { ThemeProvider, DEFAULT_PREFS, type Prefs } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import FormGuard from "@/components/ui/FormGuard";
import { getBrand, getSettingBool, getSettings, getTheme } from "@/lib/settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://aalm-vastralay.vercel.app";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${brand.name} – Wedding & Ethnic Wear Marketplace`, template: `%s | ${brand.name}` },
    description: brand.tagline,
    keywords: ["bridal lehenga online", "banarasi saree", "sherwani", "ethnic wear", "wedding wear India", "cash on delivery", "Bihar ethnic boutique"],
    openGraph: {
      title: `${brand.name} – Wedding & Ethnic Wear Marketplace`,
      description: brand.tagline,
      type: "website",
      url: siteUrl,
      siteName: brand.name,
      locale: "en_IN",
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `${brand.name} – Luxury Wedding & Ethnic Wear`,
        },
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `${brand.name} – Luxury Wedding & Ethnic Wear`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${brand.name} – Wedding & Ethnic Wear Marketplace`,
      description: brand.tagline,
      images: [`${siteUrl}/twitter-image`],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon", sizes: "64x64", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/apple-icon", sizes: "180x180", type: "image/png" },
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "mask-icon",
          url: "/safari-pinned-tab.svg",
          color: "#7a1f2b",
        },
      ],
    },
    manifest: "/manifest.json",
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7a1f2b" },
    { media: "(prefers-color-scheme: dark)", color: "#12100f" },
  ],
  width: "device-width",
  initialScale: 1,
};

function readPrefs(raw: string | undefined, defaultMode: Prefs["mode"]): Prefs {
  if (!raw) return { ...DEFAULT_PREFS, mode: defaultMode };
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Prefs>;
    return { ...DEFAULT_PREFS, mode: defaultMode, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS, mode: defaultMode };
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [theme, brand, settings, showAnalytics, showSellerHub, showWishlist] = await Promise.all([
    getTheme(),
    getBrand(),
    getSettings(),
    getSettingBool("features.analytics", true),
    getSettingBool("features.sellerHub", true),
    getSettingBool("features.wishlist", true),
  ]);
  const cookieStore = await cookies();
  const prefs = readPrefs(cookieStore.get("av_prefs")?.value, theme.defaultMode);
  const analyticsSrc = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;
  const analyticsDomain = process.env.NEXT_PUBLIC_LOGLYUK_DOMAIN;
  const isDark = prefs.mode === "dark";

  const cssVars = {
    "--theme-primary": theme.primary || "#7a1f2b",
    "--theme-primary-dark": theme.primaryLight || "#fb7185",
    "--theme-accent": theme.accent || "#D4AF37",
    "--theme-accent-dark": theme.accentLight || "#FBBF24",
    "--radius": theme.radius,
    "--font-display-stack": theme.fontDisplay,
  } as React.CSSProperties;

  return (
    <html lang="en" className={`${isDark ? "dark" : ""} ${prefs.density === "compact" ? "density-compact" : ""} ${prefs.motion ? "" : "reduce-motion"}`} style={{ ...cssVars, colorScheme: isDark ? "dark" : "light" }}>
      <body className="flex min-h-dvh flex-col overflow-x-clip antialiased">
        <ThemeProvider initial={prefs}>
          <ToastProvider>
            <FormGuard />
            <Header />
            <main className="w-full max-w-full min-w-0 flex-1 pb-[96px] lg:pb-0">{children}</main>
            <Footer />
            <MobileTabBar
              showWishlist={showWishlist}
              showSellerHub={showSellerHub}
              sellerFreeMonths={Number(settings["seller.freeMonths"] ?? 6)}
            />
            <FloatingBar whatsapp={brand.whatsapp} phone={brand.phone} showThemeToggle={theme.allowUserToggle} />
            <Script id="av-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "OnlineStore",
                name: brand.name,
                description: brand.tagline,
                email: brand.email,
                telephone: brand.phone,
                address: { "@type": "PostalAddress", streetAddress: brand.address, addressCountry: "IN" },
              }).replace(/</g, "\\u003c"),
            }} />
            {showAnalytics && analyticsSrc && analyticsDomain && (
              <Script defer data-domain={analyticsDomain} src={analyticsSrc} strategy="afterInteractive" />
            )}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
