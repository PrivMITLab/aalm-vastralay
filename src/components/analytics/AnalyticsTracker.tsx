"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";

/**
 * 👑 AALM VASTRALAY — COOKIELESS ROUTE ANALYTICS TRACKER
 * Listens to client-side Next.js route navigation and batches non-blocking
 * page_view events via OpenPanel with zero PII and zero performance overhead.
 */
function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    // Track pageview on route change (strips PII automatically via analytics.track)
    analytics.track("page_view", {
      pathname,
      search: searchParams?.toString() ? `?${searchParams.toString()}` : undefined,
    });
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
