import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function FestiveOccasionsBar() {
  const occasions = [
    { label: "शादी व बारात", sub: "Wedding Special", query: "wedding", emoji: "💍", color: "from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/30" },
    { label: "हल्दी सेरेमनी", sub: "Haldi Special", query: "haldi", emoji: "🟡", color: "from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30" },
    { label: "मेहंदी उत्सव", sub: "Mehendi Collection", query: "mehendi", emoji: "🌿", color: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30" },
    { label: "तिलक व संगीत", sub: "Sangeet & Tilak", query: "sangeet", emoji: "🌸", color: "from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30" },
    { label: "छठ व पूजा", sub: "Chhath & Pooja", query: "pooja", emoji: "🪔", color: "from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30" },
    { label: "रॉयल रिसेप्शन", sub: "Reception Party", query: "reception", emoji: "✨", color: "from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30" },
    { label: "दुल्हन लहंगा", sub: "Bridal Dulhan", query: "bridal", emoji: "👑", color: "from-maroon-50 to-rose-50 dark:from-maroon-950/40 dark:to-rose-950/30" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-4">
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-maroon-800 text-amber-300 dark:bg-amber-400 dark:text-maroon-950 shadow-xs">
            <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: "8s" }} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-maroon-900 dark:text-amber-200 sm:text-base">
              त्योहार व शादी की खरीदारी (Shop by Occasion)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Apne shubh avsar ke anusaar chuniye behtareen poshak
            </p>
          </div>
        </div>
        <Link
          href="/products"
          className="hidden text-xs font-semibold text-maroon-700 hover:underline dark:text-amber-400 sm:inline-block"
        >
          Sabhi Dekhein →
        </Link>
      </div>

      {/* Horizontal smooth swipeable carousel */}
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-7">
        {occasions.map((occ) => (
          <Link
            key={occ.query}
            href={`/products?q=${encodeURIComponent(occ.query)}`}
            className={`group relative flex min-w-[140px] flex-col items-center justify-center rounded-2xl border border-cream-200/80 dark:border-zinc-800 bg-gradient-to-b ${occ.color} p-3 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md sm:min-w-0`}
          >
            <span className="text-2xl transition-transform duration-300 group-hover:scale-125">
              {occ.emoji}
            </span>
            <span className="mt-1.5 text-xs font-bold text-slate-800 dark:text-zinc-100 group-hover:text-maroon-800 dark:group-hover:text-amber-300">
              {occ.label}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
              {occ.sub}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
