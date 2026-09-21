import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { LegalLayout } from "../layout";
import { getBrand } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact us" };

export default async function ContactPage() {
  const brand = await getBrand();
  const wa = `https://wa.me/${brand.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Namaste! I need help with an order on " + brand.name + ".")}`;
  return (
    <LegalLayout slug="contact" updated="1 January 2025">
      <p>Real humans answer these. Typical reply time is a few hours, 7 days a week.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="rounded-xl border border-[color:var(--border)] p-4">
          <p className="mb-1 flex items-center gap-2 font-semibold text-[color:var(--text)]">
            <Phone className="h-4 w-4 text-[color:var(--brand)]" /> Phone
          </p>
          <p>
            <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="text-[color:var(--brand)] hover:underline">
              {brand.phone}
            </a>
          </p>
        </li>
        <li className="rounded-xl border border-[color:var(--border)] p-4">
          <p className="mb-1 flex items-center gap-2 font-semibold text-[color:var(--text)]">
            <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
          </p>
          <p>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
              Chat now ({brand.whatsapp})
            </a>
          </p>
        </li>
        <li className="rounded-xl border border-[color:var(--border)] p-4">
          <p className="mb-1 flex items-center gap-2 font-semibold text-[color:var(--text)]">
            <Mail className="h-4 w-4 text-[color:var(--brand)]" /> Email
          </p>
          <p>
            <a href={`mailto:${brand.email}`} className="text-[color:var(--brand)] hover:underline">
              {brand.email}
            </a>
          </p>
        </li>
        <li className="rounded-xl border border-[color:var(--border)] p-4">
          <p className="mb-1 flex items-center gap-2 font-semibold text-[color:var(--text)]">
            <MapPin className="h-4 w-4 text-[color:var(--brand)]" /> Registered office
          </p>
          <p className="text-[color:var(--text-muted)]">{brand.address}</p>
        </li>
      </ul>
      <p className="text-xs">For privacy / data-deletion requests, write to <a href={`mailto:privacy@${brand.email.split("@")[1] ?? "aalmvastralay.in"}`} className="text-[color:var(--brand)] underline">privacy@{brand.email.split("@")[1] ?? "aalmvastralay.in"}</a>.</p>
    </LegalLayout>
  );
}
