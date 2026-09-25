"use client";

import ErrorPanel from "@/components/ErrorPanel";

export default function OrdersError({
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
        title="Orders load nahi ho paye"
        subtitle="Aapke orders ka vivaran laane me samasya aayi. Kripya dobara try karein."
        backHref="/dashboard"
        backLabel="Dashboard par jayein"
      />
    </div>
  );
}
