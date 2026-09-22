"use client";

import { MessageCircle, Share2 } from "lucide-react";

type WhatsAppShareProps = {
  title: string;
  price: number;
  slug: string;
  storePhone?: string | null;
  storeName?: string;
};

export default function WhatsAppShare({ title, price, slug, storePhone, storeName }: WhatsAppShareProps) {
  const getProductUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/products/${slug}`;
    }
    return `https://aalm-vastralay.pages.dev/products/${slug}`;
  };

  const handleShareFamily = () => {
    const url = getProductUrl();
    const text = encodeURIComponent(
      `Check out this beautiful outfit on Aalm Vastralay!\n\n✨ *${title}*\n💰 Price: ₹${price.toLocaleString("en-IN")}\n\nView details & photos here:\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleChatStylist = () => {
    const phone = storePhone?.replace(/\D/g, "") || "918434061342";
    const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const url = getProductUrl();
    const text = encodeURIComponent(
      `Hello ${storeName || "Aalm Vastralay"}, I am interested in *${title}* (₹${price.toLocaleString("en-IN")}).\nLink: ${url}\nCould you share real fabric video or sizing guidance?`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleShareFamily}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50/50 px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-300"
      >
        <Share2 className="h-3.5 w-3.5 text-emerald-600" />
        Share on WhatsApp
      </button>

      <button
        type="button"
        onClick={handleChatStylist}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--brand)] transition-colors hover:bg-[color:var(--surface-2)]"
      >
        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
        Chat with Stylist
      </button>
    </div>
  );
}
