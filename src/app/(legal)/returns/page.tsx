import type { Metadata } from "next";
import { LegalLayout } from "../layout";

export const dynamic = "force-static";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ReturnsPage() {
  return (
    <LegalLayout slug="returns" updated="1 January 2025">
      <p>We want you to love every piece. If something isn’t right, you have a full return window (configurable by the seller, shown at checkout) from the moment the order is marked delivered.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">Eligible returns</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Damaged, defective or incorrect item received</li>
        <li>Significant difference from the description / photos</li>
        <li>Size issue (where the size chart was followed correctly)</li>
        <li>Simply changed your mind (only for select categories; non-discounted items)</li>
      </ul>

      <h2 className="text-base font-semibold text-[color:var(--text)]">Not eligible</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Used, washed or altered items</li>
        <li>Custom-stitched or made-to-order pieces</li>
        <li>Items returned after the return window</li>
        <li>Earrings, cosmetics and personal-care items</li>
      </ul>

      <h2 className="text-base font-semibold text-[color:var(--text)]">How to request a return</h2>
      <ol className="list-decimal space-y-1 pl-6">
        <li>Open <code>/orders</code> and choose the order.</li>
        <li>Click <b>Request return</b> and enter the reason.</li>
        <li>Our logistics partner will pick up the parcel within 2–3 business days (free of charge).</li>
        <li>Once we receive and verify the item, your refund is initiated the same day.</li>
      </ol>

      <h2 className="text-base font-semibold text-[color:var(--text)]">Refunds</h2>
      <p>Prepaid orders are refunded to the original payment method (UPI / card / net banking) within 5–7 business days. Cash on Delivery orders are refunded via UPI to a bank account you nominate. Shipping fees are non-refundable unless the return is due to our error.</p>

      <h2 className="text-base font-semibold text-[color:var(--text)]">Shipping</h2>
      <p>We ship pan-India through trusted courier partners. Standard delivery is 2–6 business days, and is free above the threshold shown in the header. Tracking details are emailed the moment your order ships.</p>
    </LegalLayout>
  );
}
