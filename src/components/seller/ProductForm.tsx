"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState, useMemo, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/actions/seller";
import SubmitButton from "@/components/SubmitButton";
import type { Product, ProductVariant } from "@/db/schema";
import { resolveThumbnail } from "@/lib/media-resolver";

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

export default function ProductForm({ categories, product }: { categories: CategoryOption[]; product?: (Product & { variants: ProductVariant[] }) | null }) {
  const [state, action] = useActionState(saveProduct, null);
  const [images, setImages] = useState((product?.images ?? []).join("\n"));
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.variants ?? []).map((v) => ({ key: nextKey(), id: v.id, size: v.size ?? "", color: v.color ?? "", stock: v.stock, priceAdjustment: v.priceAdjustment, sku: v.sku ?? "" })),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
  const variantStock = variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);

  function updateVariant(key: string, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function addPreset(sizes: string[]) {
    setVariants((rows) => [...rows, ...sizes.filter((s) => !rows.some((r) => r.size === s && !r.color)).map((s) => ({ key: nextKey(), size: s, color: "", stock: 5, priceAdjustment: 0, sku: "" }))]);
  }

  async function uploadLocal(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 6)) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = () => reject(fr.error);
          fr.readAsDataURL(file);
        });
        const res = await fetch("/api/uploads/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: dataUrl, mime: file.type }),
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
        uploaded.push(json.url);
      }
      setImages((prev) => [...uploaded, prev].filter(Boolean).join("\n"));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !files.length) return;
    // Zero-config path: local disk upload (works on Node hosts, CI, local dev).
    if (!canUpload) return uploadLocal(files);
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 6)) {
        const authRes = await fetch("/api/upload/auth");
        if (!authRes.ok) throw new Error("Upload auth failed");
        const auth = (await authRes.json()) as { token: string; expire: number; signature: string };
        const fd = new FormData();
        fd.append("file", file);
        fd.append("fileName", file.name);
        fd.append("publicKey", ikPublicKey!);
        fd.append("signature", auth.signature);
        fd.append("expire", String(auth.expire));
        fd.append("token", auth.token);
        fd.append("folder", "/products");
        fd.append("useUniqueFileName", "true");
        const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("ImageKit upload failed");
        const json = (await res.json()) as { filePath: string };
        uploaded.push(`ik:${json.filePath.replace(/^\//, "")}`);
      }
      setImages((prev) => [prev.trim(), ...uploaded].filter(Boolean).join("\n"));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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
            <input id="title" name="title" className="input" defaultValue={product?.title ?? ""} placeholder="e.g. Scarlet Zardozi Bridal Lehenga Set" required minLength={5} maxLength={160} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="categoryId">
                Category
              </label>
              <select id="categoryId" name="categoryId" className="input" defaultValue={product?.categoryId ?? ""} required>
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
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea id="description" name="description" className="input min-h-36" defaultValue={product?.description ?? ""} placeholder="Fabric, work, what's included, care instructions, blouse details…" maxLength={5000} />
          </div>
          <div>
            <label className="label" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input id="tags" name="tags" className="input" defaultValue={(product?.tags ?? []).join(", ")} placeholder="bridal, lehenga, zardozi, red" />
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold text-maroon-900">Pricing & stock</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="price">
                Selling price (₹)
              </label>
              <input id="price" name="price" type="number" min={1} step="0.01" className="input" defaultValue={product?.price ?? ""} required />
            </div>
            <div>
              <label className="label" htmlFor="mrp">
                MRP (₹)
              </label>
              <input id="mrp" name="mrp" type="number" min={0} step="0.01" className="input" defaultValue={product?.mrp ?? ""} placeholder="Shown struck-through" />
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
        <section className="card space-y-3 p-5">
          <h2 className="font-semibold text-maroon-900">Images</h2>
          {canUpload ? (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-cream-300 p-5 text-center text-sm text-slate-600 hover:border-maroon-400">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-maroon-700" /> : <ImagePlus className="h-6 w-6 text-maroon-700" />}
              <span>{uploading ? "Uploading to ImageKit…" : "Click to upload (max 6)"}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
            </label>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-cream-300 p-5 text-center text-sm text-slate-600 hover:border-maroon-400">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-maroon-700" /> : <ImagePlus className="h-6 w-6 text-maroon-700" />}
              <span>{uploading ? "Uploading…" : "Click to upload photos (max 6)"}</span>
              <span className="text-[11px] text-slate-400">Stored on your server · JPG, PNG, WebP, AVIF</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadLocal(e.target.files)} disabled={uploading} />
            </label>
          )}
          {uploadError && <p className="text-xs text-rose-700">{uploadError}</p>}
          <textarea name="images" className="input min-h-28 font-mono text-xs" value={images} onChange={(e) => setImages(e.target.value)} placeholder={"https://example.com/photo-1.jpg\nik:products/photo-2.jpg\nb2:orders/photo-3.jpg"} />
          {imageList.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {imageList.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${src}-${i}`} src={resolveThumbnail(src)} alt="" className="aspect-[3/4] w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
          <div>
            <label className="label" htmlFor="videoUrl">
              Video (YouTube unlisted link or ImageKit path)
            </label>
            <input id="videoUrl" name="videoUrl" className="input" defaultValue={product?.videoUrl ?? ""} placeholder="https://youtu.be/… or ik:videos/lehenga.mp4" />
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