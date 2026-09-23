"use client";

import { createWhatsAppOrderConfirmLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

interface Props {
  orderNumber: string;
  itemsSummary?: string;
  total: number;
  storePhone?: string | null;
  className?: string;
}

export default function WhatsAppOrderButton({
  orderNumber,
  itemsSummary,
  total,
  storePhone,
  className = "",
}: Props) {
  const link = createWhatsAppOrderConfirmLink({
    orderNumber,
    itemsSummary,
    total,
    phone: storePhone,
  });

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      <span>1-Click WhatsApp Confirm</span>
    </a>
  );
}
