import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/settings";

export const revalidate = 86400;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const brand = await getBrand();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return {
    name: brand.name,
    short_name: brand.name.split(" ")[0] ?? "Aalm",
    description: brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#0f081d",
    theme_color: "#4A148C",
    icons: [
      { src: `${base}/icon?`, sizes: "64x64", type: "image/png" },
      { src: `${base}/apple-icon?`, sizes: "180x180", type: "image/png" },
      { src: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/maskable-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/maskable-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    categories: ["shopping", "lifestyle"],
  };
}
