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
    <div className="flex flex-wrap gap-2.5">
      <button
        type="button"
        onClick={handleShareFamily}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-600/40 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95"
      >
        <Share2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        Share on WhatsApp
      </button>

      <button
        type="button"
        onClick={handleChatStylist}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-xs font-bold text-stone-800 dark:text-stone-100 shadow-xs transition hover:bg-stone-50 dark:hover:bg-stone-700 active:scale-95"
      >
        <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        Chat with Stylist
      </button>
    </div>
  );
}
