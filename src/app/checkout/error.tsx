"use client";

import ErrorPanel from "@/components/ErrorPanel";

export default function CheckoutError({
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
        title="Checkout me samasya aayi"
        subtitle="Suraksha ya network kaaran se payment/order page ruk gaya. Kripya 'Dobara try karo' dabayein."
        backHref="/cart"
        backLabel="Cart par wapas jayein"
      />
    </div>
  );
}
