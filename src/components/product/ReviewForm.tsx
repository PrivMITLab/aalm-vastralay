"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/actions/orders";
import SubmitButton from "@/components/SubmitButton";
import { cn } from "@/lib/utils";

export default function ReviewForm({ productId }: { productId: string }) {
  const [state, action] = useActionState(submitReview, null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state?.success) {
    return <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{state.success}</p>;
  }

  return (
    <form onSubmit={preventDoubleSubmit} action={action} className="card space-y-4 p-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
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
      {state?.error && <p className="text-sm text-rose-700">{state.error}</p>}
      <SubmitButton pendingText="Publishing…">Publish review</SubmitButton>
    </form>
  );
}