"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Sparkles, Tag, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import type { GenerateDescriptionOutput } from "@/app/api/ai/generate-description/route";

type GenerateDescriptionButtonProps = {
  getTitle: () => string;
  getCategoryName: () => string;
  getPrice: () => number | undefined;
  onApplyDescription: (text: string) => void;
  onApplyTags?: (tags: string[]) => void;
};

export default function GenerateDescriptionButton({
  getTitle,
  getCategoryName,
  getPrice,
  onApplyDescription,
  onApplyTags,
}: GenerateDescriptionButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fabric, setFabric] = useState("Banarasi Silk Blend");
  const [occasion, setOccasion] = useState("Wedding / Reception");
  const [tone, setTone] = useState<"royal" | "bridal" | "festive" | "modern">("royal");
  const [result, setResult] = useState<GenerateDescriptionOutput | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const title = getTitle();
    if (!title || title.trim().length < 3) {
      toast.error("कृपया पहले प्रोडक्ट का Title दर्ज करें (Min 3 characters)");
      return;
    }

    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          categoryName: getCategoryName(),
          price: getPrice(),
          fabric,
          occasion,
          tone,
        }),
      });

      const json = (await res.json()) as { ok?: boolean; data?: GenerateDescriptionOutput; error?: string };
      if (!res.ok || !json.data) {
        throw new Error(json.error || "विवरण जनरेट करने में असमर्थ।");
      }

      setResult(json.data);
      toast.success("AI विवरक तैयार है! (Description generated)");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error generating description");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result) return;
    onApplyDescription(result.formattedText);
    if (onApplyTags && result.seoKeywords && result.seoKeywords.length > 0) {
      onApplyTags(result.seoKeywords);
    }
    toast.success("विवरण और SEO टैग्स फॉर्म में अपडेट हो गए!");
    setOpen(false);
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.formattedText);
    setCopied(true);
    toast.info("कॉपी किया गया!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/40 dark:to-rose-950/40 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-xs transition hover:brightness-105 active:scale-95 disabled:opacity-50"
        title="Auto-generate luxury Hinglish + English product description with AI"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
            <span>AI सोच रहा है...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>AI Copywriter (विवरण बनाएं)</span>
          </>
        )}
      </button>

      {/* Modal Dialog */}
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface-2)]/60 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[color:var(--brand)]">
                    Aalm AI Luxury Copywriter (आलम AI लेखक)
                  </h3>
                  <p className="text-[11px] text-[color:var(--text-soft)]">
                    100% Free · Hinglish & English E-commerce Specialist
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Quick Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]/30 p-3 text-xs">
                <div>
                  <label className="font-semibold text-[color:var(--text-muted)] block mb-1">Fabric (कपड़ा)</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="input py-1 text-xs"
                    placeholder="e.g. Katan Silk, Georgette"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[color:var(--text-muted)] block mb-1">Occasion (अवसर)</label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="input py-1 text-xs"
                    placeholder="e.g. Bridal, Sangeet"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[color:var(--text-muted)] block mb-1">Tone (अंदाज)</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as "royal" | "bridal" | "festive" | "modern")}
                    className="input py-1 text-xs"
                  >
                    <option value="royal">Royal & Heritage (शाही)</option>
                    <option value="bridal">Bridal Opulence (दुल्हन)</option>
                    <option value="festive">Festive Celebrations (त्योहार)</option>
                    <option value="modern">Modern Contemporary (आधुनिक)</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[color:var(--brand)] mb-3" />
                  <p className="text-sm font-semibold text-[color:var(--brand)]">
                    भारतीय कारीगरी और विलासिता का विवरण लिखा जा रहा है...
                  </p>
                  <p className="text-xs text-[color:var(--text-soft)] mt-1">
                    Analyzing weave, drape, styling tips, and SEO keywords
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  {/* Short Hook */}
                  <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Short Tagline Hook
                    </span>
                    <p className="text-xs font-medium text-amber-950 dark:text-amber-100 mt-1">
                      {result.shortDescription}
                    </p>
                  </div>

                  {/* Narrative Body */}
                  <div>
                    <span className="text-xs font-bold text-[color:var(--brand)]">Long Narrative Story:</span>
                    <p className="mt-1 text-xs text-[color:var(--text)] whitespace-pre-line leading-relaxed border border-[color:var(--border)] rounded-xl p-3 bg-[color:var(--surface)]">
                      {result.longDescription}
                    </p>
                  </div>

                  {/* Highlights */}
                  {result.highlights.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-[color:var(--brand)]">Key Highlights:</span>
                      <ul className="mt-1 space-y-1 text-xs text-[color:var(--text-muted)] border border-[color:var(--border)] rounded-xl p-3 bg-[color:var(--surface)]">
                        {result.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* SEO Keywords */}
                  {result.seoKeywords.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-[color:var(--brand)] flex items-center gap-1">
                        <Tag className="h-3 w-3 text-amber-600" />
                        High-Converting SEO Tags:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {result.seoKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-0.5 text-[11px] text-[color:var(--text-soft)]"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[color:var(--border)] bg-[color:var(--surface-2)]/60 px-5 py-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="btn btn-outline text-xs h-9 px-3"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Regenerate (दोबारा बनाएं)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!result}
                  className="btn btn-outline text-xs h-9 px-3"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Text
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!result}
                  className="btn btn-primary text-xs h-9 px-4 font-bold"
                >
                  Use in Product Form (फॉर्म में लागू करें)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
