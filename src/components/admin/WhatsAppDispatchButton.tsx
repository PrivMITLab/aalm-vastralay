"use client";

import { createWhatsAppDispatchLink } from "@/lib/whatsapp";
import { Send } from "lucide-react";

interface Props {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  courier?: string | null;
  trackingNumber?: string | null;
  className?: string;
}

export default function WhatsAppDispatchButton({
  customerName,
  customerPhone,
  orderNumber,
  courier,
  trackingNumber,
  className = "",
}: Props) {
  const link = createWhatsAppDispatchLink({
    customerName,
    customerPhone,
    orderNumber,
    courier,
    trackingNumber,
  });

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 ${className}`}
      title="Send live dispatch tracking details to customer on WhatsApp"
    >
      <Send className="h-3.5 w-3.5 text-emerald-600" />
      <span>WhatsApp Dispatch Update</span>
    </a>
  );
}
