import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aalm-vastralay.pages.dev";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/seller", "/dashboard", "/cart", "/checkout", "/orders", "/wishlist", "/notifications", "/onboarding", "/api/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
