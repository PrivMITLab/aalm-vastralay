"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState, useState, useTransition } from "react";
import { Star, Camera, X, Loader2 } from "lucide-react";
import { submitReview } from "@/actions/orders";
import SubmitButton from "@/components/SubmitButton";
import { cn } from "@/lib/utils";
import { uploadToB2 } from "@/lib/upload-client";

export default function ReviewForm({ productId }: { productId: string }) {
  const [state, action] = useActionState(submitReview, null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      setUploadError("Maximum 4 photos allowed per review.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Each photo must be under 5 MB.");
        }
        const uploaded = await uploadToB2(file, "products");
        if (uploaded.servableUrl) {
          newUrls.push(uploaded.servableUrl);
        }
      }
      setImages((prev) => [...prev, ...newUrls].slice(0, 4));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (state?.success) {
    return <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{state.success}</p>;
  }

  return (
    <form onSubmit={preventDoubleSubmit} action={action} className="card space-y-4 p-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div>
        <p className="label">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} aria-label={`${i} star`}>
              <Star className={cn("h-7 w-7 transition", i <= (hover || rating) ? "fill-gold-500 text-gold-500" : "fill-slate-100 text-slate-300")} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="review-title">
          Title (optional)
        </label>
        <input id="review-title" name="title" className="input" placeholder="Sum it up in a few words" maxLength={120} />
      </div>
      <div>
        <label className="label" htmlFor="review-body">
          Your review
        </label>
        <textarea id="review-body" name="body" className="input" placeholder="How was the fabric, fit, colour and delivery?" required minLength={10} maxLength={2000} />
      </div>

      {/* UGC Customer Photos Upload */}
      <div>
        <label className="label flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Camera className="h-4 w-4 text-burgundy-700" />
            Add Real Photos (Optional)
          </span>
          <span className="text-xs text-slate-500">{images.length}/4 photos</span>
        </label>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-3">
            {images.map((url, idx) => (
              <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 h-5 w-5 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center transition"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 4 && (
          <label className={cn(
            "flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-burgundy-400 rounded-xl p-3 text-xs font-medium text-slate-600 cursor-pointer transition bg-slate-50/50 hover:bg-burgundy-50/20",
            uploading && "opacity-50 pointer-events-none"
          )}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-burgundy-700" />
                <span>Uploading customer photo…</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 text-burgundy-700" />
                <span>Upload Photos (Max 4, JPG/PNG/WEBP under 5MB)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        )}
        {uploadError && <p className="mt-1 text-xs text-rose-600">{uploadError}</p>}
      </div>

      {state?.error && <p className="text-sm text-rose-700">{state.error}</p>}
      <SubmitButton pendingText="Publishing…">Publish review</SubmitButton>
    </form>
  );
}