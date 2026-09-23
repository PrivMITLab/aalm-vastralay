"use client";

import { createWhatsAppWeddingConsultLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

interface Props {
  productTitle: string;
  productSlug?: string;
  storePhone?: string | null;
  className?: string;
}

export default function WhatsAppConsultButton({
  productTitle,
  productSlug,
  storePhone,
  className = "",
}: Props) {
  const link = createWhatsAppWeddingConsultLink({
    productTitle,
    productSlug,
    phone: storePhone,
  });

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100/80 active:scale-95 ${className}`}
    >
      <MessageCircle className="h-4 w-4 text-emerald-600" />
      <span>Wedding Consultation / Sizing on WhatsApp</span>
    </a>
  );
}
