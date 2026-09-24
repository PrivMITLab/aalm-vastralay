import { ShieldCheck, Truck, Wallet, Sparkles, Video, Scissors, Award } from "lucide-react";

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
      <div className="rounded-3xl border border-amber-300/30 dark:border-amber-700/25 bg-gradient-to-br from-cream-50 via-white to-cream-100 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-50 dark:bg-amber-950/50 px-3.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-xs">
            <Award className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> भारत का विश्वसनीय एथनिक बाज़ार · 100% Handcrafted
          </span>
          <h2 className="mt-2 font-display text-xl font-bold text-maroon-900 dark:text-amber-200 sm:text-2xl">
            Aalm Vastralay Bharosa (आलम वस्त्रालय का भरोसा)
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 sm:text-sm">
            Hamare har kapde mein shamil hai Bhartiya sanskriti aur asli bunkari ki pehchan
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group relative flex flex-col items-center rounded-2xl border border-cream-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md"
              >
                <div className="mb-2 flex w-full justify-end sm:absolute sm:top-2 sm:right-2 sm:mb-0">
                  <span className="rounded-md border border-amber-200/60 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:text-amber-300">
                    {item.badge}
                  </span>
                </div>
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-maroon-50 dark:bg-maroon-950/60 text-maroon-700 dark:text-rose-300 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="mt-3 text-xs font-bold text-slate-800 dark:text-zinc-100 sm:text-sm">
                  {item.titleHindi}
                </h3>
                <p className="text-[10px] font-semibold text-maroon-700 dark:text-amber-400">
                  {item.titleEng}
                </p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-500 dark:text-zinc-400">
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
