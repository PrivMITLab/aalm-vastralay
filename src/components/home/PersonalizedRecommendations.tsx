"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";

type PersonalizedRecommendationsProps = {
  currentProductId?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
};

export default function PersonalizedRecommendations({
  currentProductId,
  title = "खास आपके लिए — Curated For You",
  subtitle = "Based on your taste, festive aesthetics, and recent interest",
  limit = 8,
}: PersonalizedRecommendationsProps) {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string>("trending");

  useEffect(() => {
    let active = true;

    // Manage guest session ID & local viewing history
    let guestId = "";
    let viewedIds: string[] = [];
    try {
      guestId = localStorage.getItem("av_guest_id") ?? "";
      if (!guestId) {
        guestId = "g_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        localStorage.setItem("av_guest_id", guestId);
      }

      const storedHistory = localStorage.getItem("av_recent_views");
      if (storedHistory) {
        viewedIds = JSON.parse(storedHistory);
      }

      // If currentProductId is passed, register view
      if (currentProductId) {
        viewedIds = [currentProductId, ...viewedIds.filter((id) => id !== currentProductId)].slice(0, 15);
        localStorage.setItem("av_recent_views", JSON.stringify(viewedIds));

        // Fire background activity tracking
        fetch("/api/activity/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityType: "view",
            guestId,
            productId: currentProductId,
          }),
        }).catch(() => {});
      }
    } catch {
      // localStorage may be disabled in private mode
    }

    async function loadRecommendations() {
      try {
        const queryParams = new URLSearchParams();
        if (guestId) queryParams.set("guestId", guestId);
        if (currentProductId) queryParams.set("productId", currentProductId);
        if (viewedIds.length > 0) queryParams.set("viewedIds", viewedIds.join(","));

        const res = await fetch(`/api/ai/recommendations?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch recommendations");

        const json = (await res.json()) as { ok?: boolean; products?: ProductCardData[]; reason?: string };
        if (active && json.products) {
          setProducts(json.products.slice(0, limit));
          if (json.reason) setReason(json.reason);
        }
      } catch (err) {
        console.warn("[PersonalizedRecommendations] Load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [currentProductId, limit]);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="my-10 sm:my-14" aria-label="Personalized Recommendations">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-[color:var(--border)] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 dark:border-amber-700/80 bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/40 dark:to-rose-950/40 px-3 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-200 shadow-xs mb-2">
            <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span>{reason === "personalized" ? "AI Personalization" : "Trending Ethnic Edit"}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[color:var(--brand)]">
            {title}
          </h2>
          <p className="text-xs text-[color:var(--text-soft)] mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Grid or Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 animate-pulse"
            >
              <div className="aspect-[3/4] w-full rounded-xl bg-[color:var(--surface-2)]" />
              <div className="mt-3 h-4 w-3/4 rounded bg-[color:var(--surface-2)]" />
              <div className="mt-2 h-4 w-1/3 rounded bg-[color:var(--surface-2)]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-6">
          {products.map((p, idx) => (
            <ProductCard key={p.id} product={p} priority={idx < 2} />
          ))}
        </div>
      )}
    </section>
  );
}
