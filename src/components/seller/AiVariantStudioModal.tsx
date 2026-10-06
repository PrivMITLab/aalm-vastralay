"use client";

import { useState } from "react";
import { Download, Loader2, Sparkles, UploadCloud, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { SmartImage } from "@/components/media/SmartImage";

export type AiVariantStudioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  baseImageUrl?: string;
  initialGarmentType?: string;
  initialAccentDetails?: string;
  onSaveVariantImage: (savedUrl: string, colorName: string) => void;
};

const ETHNIC_COLORWAYS = [
  { name: "Peacock Royal Blue", hex: "#1A365D", desc: "शाही मयूर नीला" },
  { name: "Emerald Bottle Green", hex: "#064E3B", desc: "गहरा पन्ना हरा" },
  { name: "Rani Hot Pink", hex: "#9D174D", desc: "पारंपरिक रानी पिंक" },
  { name: "Mustard Haldi Yellow", hex: "#B45309", desc: "हल्दी पीला" },
  { name: "Royal Wine / Burgundy", hex: "#581C87", desc: "रॉयल वाइन / जामुनी" },
  { name: "Ivory Cream & Antique Zari", hex: "#78716C", desc: "हाथीदांत क्रीम व ज़री" },
  { name: "Marigold Tangerine", hex: "#C2410C", desc: "गेंदा संतरी" },
  { name: "Deep Crimson Maroon", hex: "#881337", desc: "गहरा लाल महरून" },
];

const LIGHTING_PRESETS = [
  { label: "Studio Clean", prompt: "Editorial fashion studio lighting on neutral cream backdrop" },
  { label: "Palace Courtyard", prompt: "Royal heritage palace courtyard with soft warm architectural ambience" },
  { label: "Festive Evening", prompt: "Festive evening warm golden glow, luxury boutique showcase" },
];

export default function AiVariantStudioModal({
  isOpen,
  onClose,
  baseImageUrl,
  initialGarmentType,
  initialAccentDetails,
  onSaveVariantImage,
}: AiVariantStudioModalProps) {
  const [selectedColor, setSelectedColor] = useState(ETHNIC_COLORWAYS[0].name);
  const [garmentType, setGarmentType] = useState(initialGarmentType || "Ethnic Wear Garment");
  const [accentDetails, setAccentDetails] = useState(initialAccentDetails || "Antique Gold Zari Border");
  const [lightingStyle, setLightingStyle] = useState(LIGHTING_PRESETS[0].prompt);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingToB2, setIsSavingToB2] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    imageUrl: string;
    dataUrl: string | null;
    targetColor: string;
  } | null>(null);

  if (!isOpen) return null;

  async function handleGenerateVariant() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseImageUrl,
          garmentType,
          targetColor: selectedColor,
          accentDetails,
          lightingStyle,
          customPrompt,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok || !json.imageUrl) {
        throw new Error(json.error || "Variant generation failed.");
      }

      setGeneratedResult({
        imageUrl: json.imageUrl,
        dataUrl: json.dataUrl || null,
        targetColor: json.targetColor || selectedColor,
      });

      toast.success(`✨ नया रंग वेरिएंट तैयार है (${selectedColor})!`);
    } catch (err) {
      console.error("[AiVariantStudio] Error:", err);
      toast.error(err instanceof Error ? err.message : "वेरिएंट जनरेट करने में असमर्थ");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveToB2() {
    if (!generatedResult) return;
    setIsSavingToB2(true);
    try {
      let finalStoredUrl = "";

      // Path A: Upload using Base64 data URL to B2 directly
      if (generatedResult.dataUrl) {
        const safeColor = generatedResult.targetColor.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const filename = `variant-${safeColor}-${Date.now()}.jpg`;

        const res = await fetch("/api/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: generatedResult.dataUrl,
            filename,
            folder: "products",
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success || !json.asset) {
          throw new Error(json.error || "Failed to store variant in B2.");
        }

        finalStoredUrl = json.asset.fileName ? `b2:${json.asset.fileName}` : json.asset.servableUrl;
      } else {
        // Path B: Register external URL
        const res = await fetch("/api/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: generatedResult.imageUrl,
            source: "external",
            folder: "products",
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success || !json.asset) {
          throw new Error(json.error || "Failed to register variant URL.");
        }
        finalStoredUrl = json.asset.servableUrl || generatedResult.imageUrl;
      }

      onSaveVariantImage(finalStoredUrl, generatedResult.targetColor);
      toast.success(`💾 ${generatedResult.targetColor} फोटो B2 में सेव होकर प्रोडक्ट में जुड़ गई!`);
      onClose();
    } catch (err) {
      console.error("[AiVariantStudio] Save error:", err);
      toast.error(err instanceof Error ? err.message : "B2 में सेव करने में त्रुटि आई");
    } finally {
      setIsSavingToB2(false);
    }
  }

  function handleDownloadDirect() {
    if (!generatedResult) return;
    const a = document.createElement("a");
    a.href = generatedResult.dataUrl || generatedResult.imageUrl;
    const safeColor = generatedResult.targetColor.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `aalm-vastralay-${safeColor}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.info("डाउनलोड शुरू हो गया!");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800 bg-gradient-to-r from-cream-50 via-white to-amber-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                AI Variant Studio (एआई रंग वेरिएंट स्टूडियो)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                एक फोटो से अन्य रंगों के प्रामाणिक कैटलॉग वेरिएंट बनाएं व सीधे B2 में जोड़ें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="grid flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-[1fr_360px]">
          {/* Controls Column */}
          <div className="space-y-5">
            {/* Colorways Selection */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                1. नया रंग चुनें (Select Target Colorway):
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ETHNIC_COLORWAYS.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition ${
                        isSelected
                          ? "border-maroon-700 bg-maroon-50/60 ring-2 ring-maroon-700/20 dark:border-gold-400 dark:bg-stone-800"
                          : "border-stone-200 bg-stone-50/50 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {c.name.split("/")[0].trim()}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                        {c.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Garment Details & Craft */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  परिधान का प्रकार (Garment Type)
                </label>
                <input
                  type="text"
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value)}
                  placeholder="e.g. Banarasi Saree, Bridal Lehenga, Kurta"
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  कारीगरी व ज़री (Work & Zari Details)
                </label>
                <input
                  type="text"
                  value={accentDetails}
                  onChange={(e) => setAccentDetails(e.target.value)}
                  placeholder="e.g. Antique Gold Kadwa Weave, Zardozi"
                  className="input text-xs"
                />
              </div>
            </div>

            {/* Studio Lighting Style */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-700 dark:text-stone-300">
                शूटिंग लाइटिंग स्टाइल (Studio Lighting Environment)
              </label>
              <div className="flex flex-wrap gap-2">
                {LIGHTING_PRESETS.map((lp) => (
                  <button
                    key={lp.label}
                    type="button"
                    onClick={() => setLightingStyle(lp.prompt)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      lightingStyle === lp.prompt
                        ? "bg-maroon-800 text-white dark:bg-gold-500 dark:text-stone-950"
                        : "border border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    }`}
                  >
                    {lp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Override */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700 dark:text-stone-300">
                अतिरिक्त निर्देश (Optional Custom Styling Notes)
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Add subtle silver sequins, rich pleats drape"
                className="input text-xs"
              />
            </div>

            {/* Generate Trigger */}
            <button
              type="button"
              onClick={handleGenerateVariant}
              disabled={isGenerating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-amber-700 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-98 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI नया वेरिएंट बना रहा है (Generating Variant)...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Generate {selectedColor} Variant</span>
                </>
              )}
            </button>
          </div>

          {/* Preview & Action Column */}
          <div className="flex flex-col rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-850">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                {generatedResult ? "✨ तैयार वेरिएंट (Preview)" : "📷 मूल फोटो (Reference Photo)"}
              </span>
              {generatedResult && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Ready
                </span>
              )}
            </div>

            {/* Visual Box */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-200/60 dark:border-stone-700 dark:bg-stone-800 shadow-inner">
              {isGenerating ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-maroon-700 dark:text-gold-400" />
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {selectedColor} में फैब्रिक व ज़री का रेंडर जारी है...
                  </p>
                  <p className="text-[10px] text-stone-400">
                    8K Studio Quality • 4:5 Portrait Ratio
                  </p>
                </div>
              ) : generatedResult ? (
                <SmartImage
                  src={generatedResult.dataUrl || generatedResult.imageUrl}
                  alt={`${generatedResult.targetColor} variant`}
                  className="h-full w-full object-cover"
                />
              ) : baseImageUrl ? (
                <SmartImage
                  src={baseImageUrl}
                  alt="Base reference"
                  className="h-full w-full object-cover opacity-90"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-stone-400">
                  बाईं ओर से रंग चुनकर &quot;Generate Variant&quot; दबाएं
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {generatedResult && (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleSaveToB2}
                  disabled={isSavingToB2}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                >
                  {isSavingToB2 ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>B2 स्टोरेज में सेव हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>1-Click Save to B2 & Add to Form</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDirect}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-750"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Image (डाउनलोड करें)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
