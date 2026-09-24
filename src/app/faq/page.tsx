import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, HelpCircle, MessageCircle, Phone, Sparkles } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) – Aalm Vastralay",
  description: "Find answers to common questions about orders, bridal custom stitching, Banarasi saree authenticity, shipping, and returns at Aalm Vastralay.",
};

const FAQ_CATEGORIES = [
  {
    title: "Orders & Tracking",
    items: [
      {
        q: "How can I track my ethnic wear order?",
        a: "Once your order is dispatched, you will receive a WhatsApp and SMS update with your real-time tracking number (AWB). You can also enter your order ID anytime on our Track Order page to see live courier milestones.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Standard ready-to-ship orders can be modified or cancelled within 4 hours of placement before dispatch. Custom tailored or stitched bridal lehengas cannot be cancelled once cutting begins.",
      },
    ],
  },
  {
    title: "Sizing & Custom Tailoring",
    items: [
      {
        q: "Do you offer custom blouse stitching and lehenga fitting?",
        a: "Yes! Every bridal lehenga, unstitched suit, and designer saree comes with our complimentary custom tailoring consultation. Our master tailors in Kalyanipur can stitch according to your custom measurements via WhatsApp video call.",
      },
      {
        q: "How do I choose the correct size?",
        a: "Please refer to our comprehensive Size Guide page which shows precise bust, waist, hip, and length measurements in inches and centimeters for Indian ethnic silhouettes.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "What is your typical delivery timeframe across India?",
        a: "Ready-to-ship ethnic wear arrives within 3 to 5 business days across Bihar, UP, Delhi-NCR, and metro cities. Remote pin codes take 5 to 7 days. Express courier dispatch is available at checkout.",
      },
      {
        q: "Is Cash on Delivery (COD) available?",
        a: "Yes, COD is available for orders up to ₹15,000 across 19,000+ pin codes in India. For high-value bridal couture above ₹15,000, secure online prepaid payment is required.",
      },
    ],
  },
  {
    title: "Authenticity & Heritage Quality",
    items: [
      {
        q: "Are your Banarasi sarees 100% authentic?",
        a: "Absolutely. Every Banarasi saree and Kanjivaram silk item is directly procured from master weavers in Varanasi and certified for genuine zari, pure silk warp and weft, with authenticity hallmarks.",
      },
      {
        q: "Can I visit your flagship showroom in person?",
        a: "Yes, you are warmly invited to our flagship showroom located at Main Road, Kalyanipur, Jamui, Bihar (811307). Experience the fabrics and try outfits in person!",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your return and exchange policy?",
        a: "We offer an easy 7-day hassle-free return and exchange policy for all unworn, unaltered ethnic garments with original tags intact. Simply initiate a return request from your account or message our support team.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/help" className="hover:text-[color:var(--brand)]">
          Help Center
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">FAQ</span>
      </nav>

      {/* Header */}
      <header className="mb-10 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <HelpCircle className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Knowledge Base
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-[color:var(--brand)]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[color:var(--text-soft)] max-w-xl mx-auto">
          Everything you need to know about our bridal collections, custom stitching, silk authenticity, and pan-India shipping.
        </p>
      </header>

      {/* FAQ Sections */}
      <div className="space-y-8">
        {FAQ_CATEGORIES.map((cat, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="font-display text-xl font-bold text-[color:var(--brand)] flex items-center gap-2 border-b border-[color:var(--border)] pb-2">
              <Sparkles className="h-4 w-4 text-[color:var(--accent)]" /> {cat.title}
            </h2>
            <div className="grid gap-3">
              {cat.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 hover:border-[color:var(--accent)]/40 transition-colors shadow-sm"
                >
                  <h3 className="text-sm font-bold text-[color:var(--text)] mb-2">
                    {item.q}
                  </h3>
                  <p className="text-xs text-[color:var(--text-soft)] leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Contact Banner */}
      <div className="mt-12 rounded-2xl border border-[color:var(--border)] bg-gradient-to-r from-[color:var(--brand)]/10 via-[color:var(--surface)] to-[color:var(--accent)]/10 p-6 sm:p-8 text-center space-y-4">
        <h3 className="font-display text-lg font-bold text-[color:var(--brand)]">
          Still have questions? We are here to help!
        </h3>
        <p className="text-xs text-[color:var(--text-soft)] max-w-md mx-auto">
          Our Kalyanipur bridal stylists and customer care specialists are available 7 days a week from 9 AM to 9 PM IST.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href="https://wa.me/918434061342?text=Hello%20Aalm%20Vastralay,%20I%20have%20a%20question%20about%20your%20collection"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Us (+91 8434061342)
          </a>
          <a
            href="tel:+918434061342"
            className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-2.5 text-xs font-bold text-[color:var(--text)] hover:bg-[color:var(--surface)] transition-colors"
          >
            <Phone className="h-4 w-4 text-[color:var(--brand)]" /> Call Customer Care
          </a>
          <Link
            href="/track-order"
            className="btn-gold px-4 py-2.5 text-xs font-bold rounded-xl shadow-md"
          >
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
