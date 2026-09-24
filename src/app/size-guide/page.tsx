import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Info,
  MessageCircle,
  Ruler,
  Scissors,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Ethnic Wear Size Guide & Measurement Chart – Aalm Vastralay",
  description: "Find accurate measurements for bridal lehengas, sarees, blouse stitching, and groom sherwanis. Complimentary custom tailoring available.",
};

const WOMEN_SIZES = [
  { size: "XS (34)", bust: '34"', waist: '28"', hip: '36"', lehengaWaist: '28"', length: '42"' },
  { size: "S (36)", bust: '36"', waist: '30"', hip: '38"', lehengaWaist: '30"', length: '42"' },
  { size: "M (38)", bust: '38"', waist: '32"', hip: '40"', lehengaWaist: '32"', length: '42"' },
  { size: "L (40)", bust: '40"', waist: '34"', hip: '42"', lehengaWaist: '34"', length: '43"' },
  { size: "XL (42)", bust: '42"', waist: '36"', hip: '44"', lehengaWaist: '36"', length: '43"' },
  { size: "2XL (44)", bust: '44"', waist: '38"', hip: '46"', lehengaWaist: '38"', length: '43"' },
  { size: "3XL (46)", bust: '46"', waist: '40"', hip: '48"', lehengaWaist: '40"', length: '44"' },
];

const MEN_SIZES = [
  { size: "S (36)", chest: '36"', waist: '32"', shoulder: '17.5"', sherwaniLength: '42"' },
  { size: "M (38)", chest: '38"', waist: '34"', shoulder: '18.0"', sherwaniLength: '43"' },
  { size: "L (40)", chest: '40"', waist: '36"', shoulder: '18.5"', sherwaniLength: '44"' },
  { size: "XL (42)", chest: '42"', waist: '38"', shoulder: '19.0"', sherwaniLength: '45"' },
  { size: "2XL (44)", chest: '44"', waist: '40"', shoulder: '19.5"', sherwaniLength: '45"' },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/help" className="hover:text-[color:var(--brand)]">
          Help
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">Size Guide</span>
      </nav>

      {/* Header */}
      <header className="mb-10 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <Ruler className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Tailoring Accuracy
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-[color:var(--brand)]">
          Ethnic Wear Size Guide & Fit Chart
        </h1>
        <p className="text-sm text-[color:var(--text-soft)] max-w-xl mx-auto">
          Ensure a flawless silhouette for your wedding or festival. Compare body measurements or book our complimentary bespoke tailoring service.
        </p>
      </header>

      {/* Custom Stitching Highlight */}
      <div className="mb-10 rounded-2xl border border-[color:var(--accent)]/30 bg-gradient-to-r from-[color:var(--brand)]/10 via-[color:var(--surface)] to-[color:var(--accent)]/10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--accent)]">
              <Sparkles className="h-3.5 w-3.5 fill-[color:var(--accent)]" /> Bespoke Kalyanipur Atelier
            </span>
            <h3 className="font-display text-lg font-bold text-[color:var(--brand)]">
              Need Made-to-Measure Custom Stitching?
            </h3>
            <p className="text-xs text-[color:var(--text-soft)] max-w-lg">
              Our master tailors provide complimentary blouse stitching, lehenga waist alteration, and sherwani tailoring via WhatsApp consultation.
            </p>
          </div>
          <a
            href="https://wa.me/918434061342?text=Hello%20Aalm%20Vastralay,%20I%20want%20to%20book%20a%20custom%20stitching%20consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 shrink-0"
          >
            <Scissors className="h-4 w-4" /> Book WhatsApp Fitting
          </a>
        </div>
      </div>

      {/* Women's Ethnic Sizing */}
      <section className="mb-10 space-y-4">
        <h2 className="font-display text-xl font-bold text-[color:var(--brand)] flex items-center gap-2">
          <Ruler className="h-4 w-4 text-[color:var(--accent)]" /> Women&apos;s Ethnic Chart (Lehengas, Suits, Gowns)
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[color:var(--surface-2)] text-[color:var(--text)] uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-3.5">Standard Size</th>
                <th className="p-3.5">Bust (Inches)</th>
                <th className="p-3.5">Waist (Inches)</th>
                <th className="p-3.5">Hip (Inches)</th>
                <th className="p-3.5">Skirt Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {WOMEN_SIZES.map((row, idx) => (
                <tr key={idx} className="hover:bg-[color:var(--surface-2)]/50">
                  <td className="p-3.5 font-bold text-[color:var(--brand)]">{row.size}</td>
                  <td className="p-3.5 font-semibold text-[color:var(--text)]">{row.bust}</td>
                  <td className="p-3.5 text-[color:var(--text-soft)]">{row.waist}</td>
                  <td className="p-3.5 text-[color:var(--text-soft)]">{row.hip}</td>
                  <td className="p-3.5 text-[color:var(--text-soft)]">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Men's Ethnic Sizing */}
      <section className="mb-10 space-y-4">
        <h2 className="font-display text-xl font-bold text-[color:var(--brand)] flex items-center gap-2">
          <Ruler className="h-4 w-4 text-[color:var(--accent)]" /> Men&apos;s Ethnic Chart (Sherwanis & Kurtas)
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[color:var(--surface-2)] text-[color:var(--text)] uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-3.5">Standard Size</th>
                <th className="p-3.5">Chest (Inches)</th>
                <th className="p-3.5">Waist (Inches)</th>
                <th className="p-3.5">Shoulder</th>
                <th className="p-3.5">Sherwani Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {MEN_SIZES.map((row, idx) => (
                <tr key={idx} className="hover:bg-[color:var(--surface-2)]/50">
                  <td className="p-3.5 font-bold text-[color:var(--brand)]">{row.size}</td>
                  <td className="p-3.5 font-semibold text-[color:var(--text)]">{row.chest}</td>
                  <td className="p-3.5 text-[color:var(--text-soft)]">{row.waist}</td>
                  <td className="p-3.5 text-[color:var(--text-soft)]">{row.shoulder}</td>
                  <td className="p-3.5 text-[color:var(--text-soft)]">{row.sherwaniLength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Measurement Tips */}
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-3">
        <h3 className="text-sm font-bold text-[color:var(--text)] flex items-center gap-2">
          <Info className="h-4 w-4 text-[color:var(--accent)]" /> Helpful Measurement Tips
        </h3>
        <ul className="list-disc list-inside space-y-1 text-xs text-[color:var(--text-soft)] leading-relaxed">
          <li><strong>Bust / Chest:</strong> Measure around the fullest part of your chest, keeping the tape comfortably snug but not tight.</li>
          <li><strong>Waist:</strong> Measure at your natural waistline, approximately 1 to 2 inches above the navel.</li>
          <li><strong>Lehenga Skirt Length:</strong> Measure from your waist where you tie the lehenga drawstring down to your desired hemline (remember to measure wearing your wedding heels/footwear!).</li>
        </ul>
      </div>
    </div>
  );
}
