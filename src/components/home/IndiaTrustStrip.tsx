import { ShieldCheck, Truck, Wallet, Sparkles, Video, Scissors } from "lucide-react";

export default function IndiaTrustStrip() {
  const trustItems = [
    {
      icon: Sparkles,
      titleHindi: "100% शुद्ध व प्रामाणिक",
      titleEng: "Authentic Indian Weaves",
      desc: "Varanasi, Surat & Bhagalpur ke kushal bunkaron dwara taiyaar.",
      badge: "Pure Fabric",
    },
    {
      icon: Wallet,
      titleHindi: "कैश ऑन डिलीवरी (COD)",
      titleEng: "Pay at Doorstep / UPI",
      desc: "Surakshit bhugtan: GPay, PhonePe, Cards ya Delivery par Cash.",
      badge: "Zero Risk",
    },
    {
      icon: Truck,
      titleHindi: "पूरे भारत में सुपरफास्ट डिलीवरी",
      titleEng: "Pan-India Express Shipping",
      desc: "Bihar, UP aur sabhi 28,000+ PIN codes par surakshit packaging.",
      badge: "Express",
    },
    {
      icon: Scissors,
      titleHindi: "फ्री फॉल, पीको व लटकन",
      titleEng: "Ready-to-Wear Finishing",
      desc: "Har saree ke saath free fall-pico aur blouse stitching sahayata.",
      badge: "Complimentary",
    },
    {
      icon: Video,
      titleHindi: "वीडियो कॉल पर देखें",
      titleEng: "Live WhatsApp Viewing",
      desc: "Ghar baithe video call par fabric aur zari ka asli rang dekhein.",
      badge: "Live Assist",
    },
    {
      icon: ShieldCheck,
      titleHindi: "7-दिन में आसान वापसी",
      titleEng: "Hassle-Free Returns",
      desc: "Pasand na aane par bina kisi jhanjhat ke turant return/exchange.",
      badge: "Guaranteed",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-3xl border border-[color:var(--accent)]/30 bg-gradient-to-br from-[color:var(--surface)] via-[color:var(--surface-2)] to-[color:var(--surface)] p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)]/50 px-3.5 py-1 text-xs font-semibold text-[color:var(--accent-fg)]">
            🇮🇳 भारत का विश्वसनीय एथनिक बाज़ार · 100% Handcrafted
          </span>
          <h2 className="mt-2 font-display text-xl font-bold text-[color:var(--brand)] sm:text-2xl">
            Aalm Vastralay Bharosa (आलम वस्त्रालय का भरोसा)
          </h2>
          <p className="mt-1 text-xs text-[color:var(--text-muted)] sm:text-sm">
            Hamare har kapde mein shamil hai Bhartiya sanskriti aur asli bunkari ki pehchan
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group relative flex flex-col items-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-md"
              >
                <span className="absolute top-2 right-2 rounded-md bg-[color:var(--surface-2)] px-1.5 py-0.5 text-[9px] font-bold text-[color:var(--accent-fg)]">
                  {item.badge}
                </span>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand)] transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-xs font-bold text-[color:var(--text)] sm:text-sm">
                  {item.titleHindi}
                </h3>
                <p className="text-[10px] font-semibold text-[color:var(--brand)]">
                  {item.titleEng}
                </p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[color:var(--text-muted)]">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
