"use client";

import ErrorPanel from "@/components/ErrorPanel";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorPanel
        error={error}
        reset={reset}
        title="Dashboard load nahi ho paya"
        subtitle="Server se data laane me samasya aayi. Kripya 'Dobara try karo' dabayein ya kuch der baad reload karein."
        backHref="/"
        backLabel="Home par jayein"
      />
    </div>
  );
}
