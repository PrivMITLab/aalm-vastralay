"use client";

import { useState } from "react";
import { Ruler, X, Check } from "lucide-react";

type Unit = "inches" | "cm";
type Gender = "women" | "men";

const WOMEN_CHART = [
  { size: "XS", bust: { inches: "32-34", cm: "81-86" }, waist: { inches: "26-28", cm: "66-71" }, hip: { inches: "34-36", cm: "86-91" }, length: { inches: "42", cm: "107" } },
  { size: "S", bust: { inches: "34-36", cm: "86-91" }, waist: { inches: "28-30", cm: "71-76" }, hip: { inches: "36-38", cm: "91-96" }, length: { inches: "42.5", cm: "108" } },
  { size: "M", bust: { inches: "36-38", cm: "91-96" }, waist: { inches: "30-32", cm: "76-81" }, hip: { inches: "38-40", cm: "96-101" }, length: { inches: "43", cm: "109" } },
  { size: "L", bust: { inches: "38-40", cm: "96-101" }, waist: { inches: "32-34", cm: "81-86" }, hip: { inches: "40-42", cm: "101-107" }, length: { inches: "43.5", cm: "110" } },
  { size: "XL", bust: { inches: "40-42", cm: "101-107" }, waist: { inches: "34-36", cm: "86-91" }, hip: { inches: "42-44", cm: "107-112" }, length: { inches: "44", cm: "112" } },
  { size: "XXL", bust: { inches: "42-44", cm: "107-112" }, waist: { inches: "36-38", cm: "91-96" }, hip: { inches: "44-46", cm: "112-117" }, length: { inches: "44.5", cm: "113" } },
  { size: "3XL", bust: { inches: "44-46", cm: "112-117" }, waist: { inches: "38-40", cm: "96-101" }, hip: { inches: "46-48", cm: "117-122" }, length: { inches: "45", cm: "114" } },
];

const MEN_CHART = [
  { size: "36 (S)", chest: { inches: "36-38", cm: "91-96" }, waist: { inches: "30-32", cm: "76-81" }, shoulder: { inches: "17.5", cm: "44" }, length: { inches: "40", cm: "101" } },
  { size: "38 (M)", chest: { inches: "38-40", cm: "96-101" }, waist: { inches: "32-34", cm: "81-86" }, shoulder: { inches: "18", cm: "46" }, length: { inches: "41", cm: "104" } },
  { size: "40 (L)", chest: { inches: "40-42", cm: "101-107" }, waist: { inches: "34-36", cm: "86-91" }, shoulder: { inches: "18.5", cm: "47" }, length: { inches: "42", cm: "107" } },
  { size: "42 (XL)", chest: { inches: "42-44", cm: "107-112" }, waist: { inches: "36-38", cm: "91-96" }, shoulder: { inches: "19", cm: "48" }, length: { inches: "43", cm: "109" } },
  { size: "44 (XXL)", chest: { inches: "44-46", cm: "112-117" }, waist: { inches: "38-40", cm: "96-101" }, shoulder: { inches: "19.5", cm: "50" }, length: { inches: "44", cm: "112" } },
];

export default function SizeGuideModal({ categoryName }: { categoryName?: string }) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<Unit>("inches");
  const isMen = categoryName?.toLowerCase().includes("men") || categoryName?.toLowerCase().includes("sherwani") || categoryName?.toLowerCase().includes("kurta");
  const [gender, setGender] = useState<Gender>(isMen ? "men" : "women");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 dark:text-gold-400 hover:text-maroon-900 dark:hover:text-gold-300 hover:underline transition-colors"
      >
        <Ruler className="h-3.5 w-3.5" />
        Size Guide & Measurements
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[color:var(--brand)]">
                  Ethnic Wear Sizing Guide
                </h3>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                  Garment measurements tailored for traditional wedding & ethnic silhouettes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Controls: Gender + Unit Toggle */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-lg bg-[color:var(--surface-2)] p-1">
                <button
                  type="button"
                  onClick={() => setGender("women")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    gender === "women"
                      ? "bg-[color:var(--surface)] text-[color:var(--brand)] shadow-xs"
                      : "text-[color:var(--text-muted)] hover:text-[color:var(--brand)]"
                  }`}
                >
                  Women (Lehengas & Suits)
                </button>
                <button
                  type="button"
                  onClick={() => setGender("men")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    gender === "men"
                      ? "bg-[color:var(--surface)] text-[color:var(--brand)] shadow-xs"
                      : "text-[color:var(--text-muted)] hover:text-[color:var(--brand)]"
                  }`}
                >
                  Men (Kurtas & Sherwanis)
                </button>
              </div>

              <div className="flex rounded-lg bg-[color:var(--surface-2)] p-1">
                <button
                  type="button"
                  onClick={() => setUnit("inches")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    unit === "inches"
                      ? "bg-[color:var(--surface)] text-[color:var(--brand)] shadow-xs"
                      : "text-[color:var(--text-muted)] hover:text-[color:var(--brand)]"
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("cm")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    unit === "cm"
                      ? "bg-[color:var(--surface)] text-[color:var(--brand)] shadow-xs"
                      : "text-[color:var(--text-muted)] hover:text-[color:var(--brand)]"
                  }`}
                >
                  CM
                </button>
              </div>
            </div>

            {/* Sizing Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)]/60 text-[color:var(--brand)]">
                    <th className="p-2.5 font-bold">Size</th>
                    {gender === "women" ? (
                      <>
                        <th className="p-2.5 font-bold">Bust ({unit})</th>
                        <th className="p-2.5 font-bold">Waist ({unit})</th>
                        <th className="p-2.5 font-bold">Hip ({unit})</th>
                        <th className="p-2.5 font-bold">Length ({unit})</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2.5 font-bold">Chest ({unit})</th>
                        <th className="p-2.5 font-bold">Waist ({unit})</th>
                        <th className="p-2.5 font-bold">Shoulder ({unit})</th>
                        <th className="p-2.5 font-bold">Length ({unit})</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)]/50">
                  {gender === "women"
                    ? WOMEN_CHART.map((row) => (
                        <tr key={row.size} className="hover:bg-[color:var(--surface-2)]/40">
                          <td className="p-2.5 font-bold text-[color:var(--brand)]">{row.size}</td>
                          <td className="p-2.5 text-[color:var(--text)]">{row.bust[unit]}</td>
                          <td className="p-2.5 text-[color:var(--text)]">{row.waist[unit]}</td>
                          <td className="p-2.5 text-[color:var(--text)]">{row.hip[unit]}</td>
                          <td className="p-2.5 text-[color:var(--text)]">{row.length[unit]}</td>
                        </tr>
                      ))
                    : MEN_CHART.map((row) => (
                        <tr key={row.size} className="hover:bg-[color:var(--surface-2)]/40">
                          <td className="p-2.5 font-bold text-[color:var(--brand)]">{row.size}</td>
                          <td className="p-2.5 text-[color:var(--text)]">{row.chest[unit]}</td>
                          <td className="p-2.5 text-[color:var(--text)]">{row.waist[unit]}</td>
                          <td className="p-2.5 text-[color:var(--text)]">{row.shoulder[unit]}</td>
                          <td className="p-2.5 text-[color:var(--text)]">{row.length[unit]}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* How to measure tips */}
            <div className="mt-5 rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent-soft)]/40 p-3.5 text-xs text-[color:var(--text)]">
              <p className="font-bold text-[color:var(--accent-fg)]">💡 Fit & Custom Stitching Tip:</p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-[color:var(--text-muted)]">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <strong>Bust/Chest:</strong> Measure across the fullest part of your bust/chest keeping the tape level.
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <strong>Waist:</strong> Measure around your natural waistline just above the navel.
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <strong>Alteration Margin:</strong> All stitched Lehengas and Kurtas include a 2-inch inner margin for easy alteration.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
