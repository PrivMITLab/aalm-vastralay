import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const brand = await getBrand();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return {
    name: brand.name,
    short_name: brand.name.split(" ")[0] ?? "Aalm",
    description: brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#fffbf5",
    theme_color: "#7a1f2b",
    icons: [
      { src: `${base}/icon?`, sizes: "64x64", type: "image/png" },
      { src: `${base}/apple-icon?`, sizes: "180x180", type: "image/png" },
    ],
    categories: ["shopping", "lifestyle"],
  };
}
