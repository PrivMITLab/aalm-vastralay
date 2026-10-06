"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState, useMemo, useState } from "react";
import { ImagePlus, Loader2, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { saveProduct } from "@/actions/seller";
import SubmitButton from "@/components/SubmitButton";
import type { Product, ProductVariant } from "@/db/schema";
import { resolveThumbnail, sanitizeImageUrl } from "@/lib/media-resolver";
import { canonicalizeImageUrl } from "@/lib/image-resolver";
import GenerateDescriptionButton from "@/components/admin/GenerateDescriptionButton";
import UniversalMediaPicker, { type MediaSelectResult } from "@/components/media/UniversalMediaPicker";
import { SmartImage } from "@/components/media/SmartImage";
import type { AiVisionAnalysisResult, AiVisionVisualAttributes } from "@/lib/ai/client";

type CategoryOption = { id: string; name: string; parentName: string | null };
type VariantRow = { key: string; id?: string; size: string; color: string; stock: number; priceAdjustment: number; sku: string };

const SIZE_PRESETS: Record<string, string[]> = {
  "S–XXL": ["S", "M", "L", "XL", "XXL"],
  "Men 38–46": ["38", "40", "42", "44", "46"],
  Kids: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
  "Free Size": ["Free Size"],
};

let keyCounter = 0;
const nextKey = () => `v${++keyCounter}-${Math.random().toString(36).slice(2, 6)}`;

function safeThumbnailUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "/images/placeholder.svg";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "/images/placeholder.svg";
  const resolved = sanitizeImageUrl(resolveThumbnail(trimmed));
  if (!resolved || resolved === "/images/placeholder.svg") return "/images/placeholder.svg";
  try {
    const parsed = new URL(resolved, "https://aalmvastralay.com");
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return encodeURI(parsed.toString());
    }
  } catch {
    // fallback
  }
  return "/images/placeholder.svg";
}

export default function ProductForm({ categories, product }: { categories: CategoryOption[]; product?: (Product & { variants: ProductVariant[] }) | null }) {
  const [state, action] = useActionState(saveProduct, null);
  const [title, setTitle] = useState(product?.title ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : "");
  const [mrp, setMrp] = useState(product?.mrp != null ? String(product.mrp) : "");
  const [images, setImages] = useState((product?.images ?? []).join("\n"));
  const [description, setDescription] = useState(product?.description ?? "");
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.variants ?? []).map((v) => ({ key: nextKey(), id: v.id, size: v.size ?? "", color: v.color ?? "", stock: v.stock, priceAdjustment: v.priceAdjustment, sku: v.sku ?? "" })),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrapingLinks, setIsScrapingLinks] = useState(false);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionDetectedBadge, setVisionDetectedBadge] = useState<string | null>(null);
  const [visualDetails, setVisualDetails] = useState<AiVisionVisualAttributes | null>(null);

  async function handleAutoDetectLinks() {
    const lines = images.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (!lines.length) return;
    setIsScrapingLinks(true);
    try {
      const updated: string[] = [];
      for (const line of lines) {
        if (line.startsWith("b2:") || line.startsWith("ik:") || line.startsWith("/")) {
          updated.push(line);
          continue;
        }
        const canonical = canonicalizeImageUrl(line);
        if (canonical !== line) {
          updated.push(canonical);
          continue;
        }
        if (/\.(jpe?g|png|webp|avif|gif|svg)(\?.*)?$/i.test(line)) {
          updated.push(line);
          continue;
        }
        if (/^https?:\/\//i.test(line)) {
          try {
            const res = await fetch("/api/admin/scrape-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: line }),
            });
            const data = await res.json();
            if (res.ok && data.ok && data.imageUrl) {
              updated.push(data.imageUrl);
              continue;
            }
          } catch {
            // keep line if scrape fails
          }
        }
        updated.push(line);
      }
      setImages(Array.from(new Set(updated)).join("\n"));
    } finally {
      setIsScrapingLinks(false);
    }
  }

  async function handleVisionAnalysis(specificImageUrl?: string) {
    const lines = images.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
    const targetImage = specificImageUrl || lines[0];
    if (!targetImage) {
      toast.error("कृपया पहले एक फोटो अपलोड करें या लिंक पेस्ट करें (Please add an image first)");
      return;
    }

    setIsAnalyzingVision(true);
    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: targetImage }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error || "Vision analysis failed.");
      }

      const data: AiVisionAnalysisResult = json.data;

      // 1. Auto-fill Title
      if (data.title) {
        setTitle(data.title);
      }

      // 2. Auto-select Category
      if (data.categoryId) {
        setCategoryId(data.categoryId);
      } else if (data.categorySlug) {
        const slug = data.categorySlug.toLowerCase();
        const matched = categories.find(
          (c) =>
            c.id.toLowerCase() === slug ||
            c.name.toLowerCase().includes(slug) ||
            slug.includes(c.name.toLowerCase())
        );
        if (matched) setCategoryId(matched.id);
      }

      // 3. Auto-fill Description
      if (data.formattedText) {
        setDescription(data.formattedText);
      } else if (data.shortDescription) {
        setDescription(data.shortDescription);
      }

      // 4. Auto-fill Tags
      if (data.tags && data.tags.length > 0) {
        setTags((prev) => {
          const existing = prev.split(",").map((s) => s.trim()).filter(Boolean);
          const merged = Array.from(new Set([...existing, ...data.tags]));
          return merged.join(", ");
        });
      }

      // 5. Auto-suggest Price & MRP if empty or 0
      if (data.suggestedPrice && (!price || Number(price) === 0)) {
        setPrice(String(data.suggestedPrice));
      }
      if (data.suggestedMrp && (!mrp || Number(mrp) === 0)) {
        setMrp(String(data.suggestedMrp));
      }

      if (data.visualAttributes) {
        setVisualDetails(data.visualAttributes);
      }

      const summaryDetails = [data.craftType, data.color, data.fabric].filter(Boolean).join(" • ");
      setVisionDetectedBadge(summaryDetails || "Ethnic Karigari Details Detected");
      toast.success(`✨ फोटो से फॉर्म ऑटो-भर दिया गया! (${data.craftType || data.title})`);
    } catch (err) {
      console.error("Vision AI error:", err);
      toast.error(err instanceof Error ? err.message : "फोटो विश्लेषण में त्रुटि आई");
    } finally {
      setIsAnalyzingVision(false);
    }
  }

  const ikPublicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const ikUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL;
  const canUpload = Boolean(ikPublicKey && ikUrl);

  const imageList = useMemo(
    () =>
      images
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean),
    [images],
  );

  const safeThumbnails = useMemo(
    () => imageList.map((src) => safeThumbnailUrl(src)),
    [imageList],
  );
  const variantStock = variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);

  function updateVariant(key: string, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function addPreset(sizes: string[]) {
    setVariants((rows) => [...rows, ...sizes.filter((s) => !rows.some((r) => r.size === s && !r.color)).map((s) => ({ key: nextKey(), size: s, color: "", stock: 5, priceAdjustment: 0, sku: "" }))]);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 6)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "products");

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: fd,
        });

        const json = (await res.json()) as { success?: boolean; asset?: { servableUrl?: string; fileName?: string }; error?: string };
        if (!res.ok || !json.success || !json.asset) {
          throw new Error(json.error ?? "Failed to upload to media storage.");
        }

        const storedUrl = json.asset.fileName ? `b2:${json.asset.fileName}` : (json.asset.servableUrl || "");
        if (storedUrl) uploaded.push(storedUrl);
      }
      setImages((prev) => [...uploaded, ...prev.split(/\r?\n|,/).map((s) => s.trim())].filter(Boolean).join("\n"));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleMediaSelect(result: MediaSelectResult) {
    if (!result?.url) return;
    const finalUrl = result.fileName ? `b2:${result.fileName}` : canonicalizeImageUrl(result.url) || result.url;
    setImages((prev) => {
      const existing = prev.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
      if (existing.includes(finalUrl)) return prev;
      return [finalUrl, ...existing].join("\n");
    });
  }

  function removeImage(indexToRemove: number) {
    setImages((prev) => {
      const list = prev.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
      return list.filter((_, idx) => idx !== indexToRemove).join("\n");
    });
  }

  return (
    <form onSubmit={preventDoubleSubmit} action={action} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants.map(({ key: _k, ...v }) => v))} />

      <div className="space-y-6">
        <section className="card space-y-4 p-5">
          <h2 className="font-semibold text-maroon-900">Basic details</h2>
          <div>
            <label className="label" htmlFor="title">
              Product title
            </label>
            <input
              id="title"
              name="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scarlet Zardozi Bridal Lehenga Set"
              required
              minLength={5}
              maxLength={160}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="categoryId">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentName ? `${c.parentName} › ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sku">
                SKU (optional)
              </label>
              <input id="sku" name="sku" className="input" defaultValue={product?.sku ?? ""} placeholder="Your internal code" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0" htmlFor="description">
                Description
              </label>
              <GenerateDescriptionButton
                getTitle={() => title}
                getCategoryName={() => {
                  const cat = categories.find((c) => c.id === categoryId);
                  return cat ? cat.name : "";
                }}
                getPrice={() => (price ? Number(price) : undefined)}
                onApplyDescription={(text) => setDescription(text)}
                onApplyTags={(newTags) => {
                  setTags((prev) => {
                    const existing = prev.split(",").map((s) => s.trim()).filter(Boolean);
                    const merged = Array.from(new Set([...existing, ...newTags]));
                    return merged.join(", ");
                  });
                }}
              />
            </div>
            <textarea
              id="description"
              name="description"
              className="input min-h-36"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fabric, work, what's included, care instructions, blouse details…"
              maxLength={5000}
            />
          </div>
          <div>
            <label className="label" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              name="tags"
              className="input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bridal, lehenga, zardozi, red"
            />
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold text-maroon-900">Pricing & stock</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="price">
                Selling price (₹)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={1}
                step="0.01"
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="mrp">
                MRP (₹)
              </label>
              <input
                id="mrp"
                name="mrp"
                type="number"
                min={0}
                step="0.01"
                className="input"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="Shown struck-through"
              />
            </div>
            <div>
              <label className="label" htmlFor="shippingWeightGrams">
                Shipping weight (grams)
              </label>
              <input id="shippingWeightGrams" name="shippingWeightGrams" type="number" min={0} step="10" className="input" defaultValue={product?.shippingWeightGrams ?? 0} />
            </div>
            <div>
              <label className="label" htmlFor="stock">
                Stock {variants.length > 0 && <span className="normal-case text-slate-400">(from variants)</span>}
              </label>
              {variants.length > 0 ? (
                <input id="stock" name="stock" type="number" className="input bg-cream-50" value={variantStock} readOnly />
              ) : (
                <input id="stock" name="stock" type="number" min={0} className="input" defaultValue={product?.stock ?? 10} required />
              )}
            </div>
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-maroon-900">Sizes & colours (variants)</h2>
            <div className="flex flex-wrap gap-1">
              {Object.entries(SIZE_PRESETS).map(([label, sizes]) => (
                <button key={label} type="button" onClick={() => addPreset(sizes)} className="rounded-full border border-cream-300 px-2.5 py-1 text-xs hover:border-maroon-400">
                  + {label}
                </button>
              ))}
            </div>
          </div>
          {variants.length === 0 ? (
            <p className="text-sm text-slate-500">No variants – the product will be sold as a single option using the stock above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="pb-2 pr-2">Size</th>
                    <th className="pb-2 pr-2">Colour</th>
                    <th className="pb-2 pr-2">Stock</th>
                    <th className="pb-2 pr-2">Price +/- (₹)</th>
                    <th className="pb-2 pr-2">SKU</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.key}>
                      <td className="py-1 pr-2">
                        <input className="input py-1.5" value={v.size} onChange={(e) => updateVariant(v.key, { size: e.target.value })} placeholder="M" />
                      </td>
                      <td className="py-1 pr-2">
                        <input className="input py-1.5" value={v.color} onChange={(e) => updateVariant(v.key, { color: e.target.value })} placeholder="Red" />
                      </td>
                      <td className="py-1 pr-2">
                        <input type="number" min={0} className="input w-20 py-1.5" value={v.stock} onChange={(e) => updateVariant(v.key, { stock: Number(e.target.value) })} />
                      </td>
                      <td className="py-1 pr-2">
                        <input type="number" step="1" className="input w-24 py-1.5" value={v.priceAdjustment} onChange={(e) => updateVariant(v.key, { priceAdjustment: Number(e.target.value) })} />
                      </td>
                      <td className="py-1 pr-2">
                        <input className="input py-1.5" value={v.sku} onChange={(e) => updateVariant(v.key, { sku: e.target.value })} placeholder="optional" />
                      </td>
                      <td className="py-1">
                        <button type="button" onClick={() => setVariants((rows) => rows.filter((r) => r.key !== v.key))} className="p-1.5 text-rose-700" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button type="button" onClick={() => setVariants((rows) => [...rows, { key: nextKey(), size: "", color: "", stock: 5, priceAdjustment: 0, sku: "" }])} className="btn btn-outline btn-sm">
            <Plus className="h-4 w-4" /> Add variant
          </button>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-maroon-900 dark:text-stone-100">Product Images</h2>
            <span className="text-xs text-slate-500 dark:text-stone-400">Up to 6 images</span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <label
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                uploadFiles(e.dataTransfer.files);
              }
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center text-sm transition-all duration-200 ${
              isDragging
                ? "border-maroon-600 bg-maroon-50/80 dark:border-gold-400 dark:bg-stone-850 scale-[1.01] shadow-md"
                : "border-maroon-200 dark:border-stone-700 bg-cream-50/50 dark:bg-stone-900/40 text-slate-600 dark:text-stone-300 hover:border-maroon-500 dark:hover:border-gold-400 hover:bg-cream-100/60 dark:hover:bg-stone-800/60"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-maroon-700 dark:text-gold-400" />
            ) : (
              <ImagePlus className={`h-7 w-7 transition-transform ${isDragging ? "scale-115 text-maroon-700 dark:text-gold-400" : "text-maroon-700 dark:text-gold-400"}`} />
            )}
            <span className="font-medium text-slate-800 dark:text-stone-200">
              {uploading
                ? "Uploading to Backblaze B2…"
                : isDragging
                ? "Drop images here to upload!"
                : "Click or drag photos here (max 6)"}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-stone-500">
              High-speed B2 Cold Storage · JPG, PNG, WebP, AVIF (Max 10MB)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => uploadFiles(e.target.files)}
              disabled={uploading}
            />
          </label>

          {/* Universal Media Picker Button */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-cream-200 dark:border-stone-800">
            <UniversalMediaPicker
              folder="products"
              buttonLabel="B2 Library / Web Link"
              onSelect={handleMediaSelect}
              className="w-full text-xs font-semibold"
            />
          </div>

          {/* 1-Click Multimodal Vision AI Auto-Fill Card */}
          <div className="rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-50 via-rose-50/40 to-amber-50/60 p-3.5 shadow-xs dark:border-amber-700/60 dark:from-amber-950/30 dark:via-stone-900 dark:to-stone-900">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950 dark:text-amber-200">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>1-Click Multimodal Vision AI</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                  तस्वीर देखकर Title, Category, Luxury विवरण और Tags स्वतः भरें
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleVisionAnalysis()}
                disabled={isAnalyzingVision || imageList.length === 0}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-maroon-800 to-amber-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                title={imageList.length === 0 ? "पहले कोई फोटो जोड़ें" : "तस्वीर से विवरण भरें"}
              >
                {isAnalyzingVision ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>AI परख रहा है...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Auto-Fill From Photo</span>
                  </>
                )}
              </button>
            </div>
            {visionDetectedBadge && (
              <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-amber-950 border border-amber-200 shadow-2xs dark:bg-stone-850 dark:text-amber-200 dark:border-amber-800">
                <span className="text-amber-600 dark:text-amber-400">✨ AI क्राफ्ट विवरण:</span>
                <span className="font-semibold">{visionDetectedBadge}</span>
              </div>
            )}

            {visualDetails && (
              <div className="mt-2.5 space-y-2 rounded-lg border border-amber-200/80 bg-white/90 p-2.5 text-[11px] dark:border-stone-700 dark:bg-stone-850">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1 dark:border-stone-700/60">
                  <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1 text-[11px]">
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    <span>तस्वीर से सत्यापित विवरण (Real Visual Details)</span>
                  </span>
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Grounded Visual
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="rounded bg-stone-50 p-1.5 dark:bg-stone-800/60">
                    <span className="text-stone-400 block">रंग (Palette):</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {visualDetails.primaryColor}
                      {visualDetails.metallicZari && visualDetails.metallicZari !== "None" ? ` • ${visualDetails.metallicZari}` : ""}
                    </span>
                  </div>
                  <div className="rounded bg-stone-50 p-1.5 dark:bg-stone-800/60">
                    <span className="text-stone-400 block">कपड़ा (Fabric/Weave):</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {visualDetails.weaveTexture}
                    </span>
                  </div>
                  <div className="col-span-2 rounded bg-stone-50 p-1.5 dark:bg-stone-800/60">
                    <span className="text-stone-400 block">कारीगरी (Karigari):</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {visualDetails.embroideryTechniques.join(", ")}
                    </span>
                  </div>
                  {visualDetails.motifs && visualDetails.motifs.length > 0 && (
                    <div className="col-span-2 rounded bg-stone-50 p-1.5 dark:bg-stone-800/60">
                      <span className="text-stone-400 block">पैटर्न व मोटिफ़:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {visualDetails.motifs.join(", ")}
                      </span>
                    </div>
                  )}
                  {visualDetails.setPieces && visualDetails.setPieces.length > 0 && (
                    <div className="col-span-2 rounded bg-stone-50 p-1.5 dark:bg-stone-800/60">
                      <span className="text-stone-400 block">सेट के हिस्से:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {visualDetails.setPieces.join(" + ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {uploadError && <p className="text-xs text-rose-700 dark:text-rose-400">{uploadError}</p>}

          {/* Thumbnail Gallery with Delete Actions */}
          {safeThumbnails.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-600 dark:text-stone-400">Current Photos (First image is Cover):</p>
              <div className="grid grid-cols-3 gap-2">
                {safeThumbnails.map((safeSrc, i) => (
                  <div
                    key={`${safeSrc}-${i}`}
                    className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-xs"
                  >
                    <SmartImage
                      src={imageList[i] || safeSrc}
                      alt={`Product photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 rounded bg-maroon-900/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white tracking-wide">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleVisionAnalysis(imageList[i])}
                      disabled={isAnalyzingVision}
                      className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-md bg-amber-600/90 hover:bg-amber-700 text-white px-1.5 py-0.5 text-[9px] font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
                      title="इस फोटो से विवरण भरें (Analyze this photo)"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-sm opacity-90 hover:opacity-100 active:scale-95 transition"
                      aria-label="Remove photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label text-xs mb-0" htmlFor="images">
                Raw Image URLs (B2 keys, Google Drive, or Web Links):
              </label>
              <button
                type="button"
                onClick={handleAutoDetectLinks}
                disabled={isScrapingLinks || !images.trim()}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-maroon-700 hover:text-maroon-800 dark:text-gold-400 hover:underline disabled:opacity-50"
              >
                {isScrapingLinks ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                <span>{isScrapingLinks ? "Detecting links…" : "Auto-Detect & Scrape"}</span>
              </button>
            </div>
            <textarea
              id="images"
              name="images"
              className="input min-h-24 font-mono text-xs"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder={"b2:products/photo-1.webp\nhttps://drive.google.com/file/d/...\nhttps://example.com/saree.jpg"}
            />
          </div>

          <div>
            <label className="label" htmlFor="videoUrl">
              Video (YouTube link or video URL)
            </label>
            <input
              id="videoUrl"
              name="videoUrl"
              className="input"
              defaultValue={product?.videoUrl ?? ""}
              placeholder="https://youtu.be/… or https://example.com/video.mp4"
            />
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-semibold text-maroon-900">Visibility</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" value="on" defaultChecked={product?.isActive ?? true} className="h-4 w-4 accent-maroon-700" />
            Live on storefront
          </label>
          <input type="hidden" name="isActive" value="off" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="h-4 w-4 accent-maroon-700" />
            Request homepage feature
          </label>
        </section>

        {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
        <SubmitButton className="w-full" pendingText="Saving…">
          {product ? "Save changes" : "Publish product"}
        </SubmitButton>
      </aside>
    </form>
  );
}