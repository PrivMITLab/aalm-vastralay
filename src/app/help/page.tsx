import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  HelpCircle,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Help Center & Customer Support – Aalm Vastralay",
  description: "Get instant assistance with your ethnic wear orders, returns, size fittings, and shipping inquiries at Aalm Vastralay Kalyanipur.",
};

const HELP_TOPICS = [
  {
    icon: Truck,
    title: "Track & Shipping",
    desc: "Find live status of your ethnic wear order and read our delivery guidelines across India.",
    link: "/track-order",
    action: "Track Order",
  },
  {
    icon: RefreshCw,
    title: "7-Day Easy Returns",
    desc: "Hassle-free return and exchange process for unstitched suits, sarees, and garments.",
    link: "/returns",
    action: "Return Policy",
  },
  {
    icon: Ruler,
    title: "Size Guide & Stitching",
    desc: "Detailed measurement charts for lehengas, blouses, sherwanis, and custom tailoring.",
    link: "/size-guide",
    action: "View Size Guide",
  },
  {
    icon: HelpCircle,
    title: "FAQ & Knowledge Base",
    desc: "Answers to frequently asked questions on fabrics, zari authenticity, and payment methods.",
    link: "/faq",
    action: "Browse FAQ",
  },
  {
    icon: ShieldCheck,
    title: "Artisan Silk Guarantee",
    desc: "Learn how we certify authentic Banarasi silk and handloom craftsmanship.",
    link: "/handbook",
    action: "Read Handbook",
  },
  {
    icon: BookOpen,
    title: "Shipping Policy",
    desc: "Timelines, courier partners (Delhivery, BlueDart), and COD eligibility rules.",
    link: "/shipping",
    action: "Shipping Info",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">Help Center</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-10 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <LifeBuoy className="h-3.5 w-3.5 text-[color:var(--accent)]" /> 24/7 Support Desk
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-5xl text-[color:var(--brand)]">
          How Can We Help You?
        </h1>
        <p className="text-sm text-[color:var(--text-soft)] max-w-xl mx-auto">
          Need help with your bridal order, sizing consultation, or custom blouse stitching? Our dedicated support team in Kalyanipur is ready to assist.
        </p>
      </header>

      {/* Grid of Topics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {HELP_TOPICS.map((topic, i) => {
          const Icon = topic.icon;
          return (
            <div
              key={i}
              className="card group flex flex-col justify-between p-6 border border-[color:var(--border)] hover:border-[color:var(--brand)]/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[color:var(--surface-2)] flex items-center justify-center text-[color:var(--brand)] group-hover:bg-[color:var(--brand)] group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-base font-bold text-[color:var(--text)]">
                  {topic.title}
                </h2>
                <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
                  {topic.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[color:var(--border)] mt-4">
                <Link
                  href={topic.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--brand)] group-hover:text-[color:var(--accent)] transition-colors"
                >
                  {topic.action} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Concierge Section */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-gradient-to-r from-[color:var(--brand)]/10 via-[color:var(--surface)] to-[color:var(--accent)]/10 p-6 sm:p-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-bold text-[color:var(--brand)]">
              <Clock className="h-3.5 w-3.5" /> 9:00 AM – 9:00 PM IST (Mon – Sun)
            </span>
            <h3 className="font-display text-2xl font-bold text-[color:var(--brand)]">
              Bridal Stylist & Concierge Desk
            </h3>
            <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
              Have questions about fabric matching, custom embroidery, or urgent wedding deliveries? Chat directly with our head stylist on WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://wa.me/918434061342?text=Hello%20Aalm%20Vastralay,%20I%20need%20assistance%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Us (+91 8434061342)
              </a>
              <a
                href="tel:+918434061342"
                className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-5 py-2.5 text-xs font-bold text-[color:var(--text)] hover:bg-[color:var(--surface)] transition-colors"
              >
                <Phone className="h-4 w-4 text-[color:var(--brand)]" /> Call Customer Care
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-3">
            <h4 className="font-display text-sm font-bold flex items-center gap-2 text-[color:var(--text)]">
              <MapPin className="h-4 w-4 text-[color:var(--accent)]" /> Flagship Showroom
            </h4>
            <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
              <strong>Aalm Vastralay (आलम वस्त्रालय)</strong><br />
              Main Market Road, Kalyanipur, Jamui,<br />
              Bihar – 811307, India.
            </p>
            <div className="pt-2 text-[11px] text-[color:var(--text-soft)] space-y-1">
              <p>Email: <a href="mailto:support@aalmvastralay.com" className="text-[color:var(--brand)] hover:underline">support@aalmvastralay.com</a></p>
              <p>GSTIN: Available on invoice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
