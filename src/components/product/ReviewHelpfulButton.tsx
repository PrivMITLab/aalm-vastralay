"use client";

import { useState, useEffect, useTransition } from "react";
import { ThumbsUp, Check, Loader2 } from "lucide-react";
import { voteReviewHelpful } from "@/actions/orders";

export default function ReviewHelpfulButton({
  reviewId,
  initialCount = 0,
  initialVoted = false,
}: {
  reviewId: string;
  initialCount?: number;
  initialVoted?: boolean;
}) {
  const [helpful, setHelpful] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  // Hydrate personal vote state from local client fallback if not already voted in DB
  useEffect(() => {
    if (initialVoted) return;

    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(`review_helpful_${reviewId}`);
        if (stored === "true") {
          setHelpful(true);
        }
      } catch {
        // ignore localStorage disabled
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [reviewId, initialVoted]);

  const handleToggle = () => {
    if (helpful || isPending) return;

    // 1. Optimistic instant UI update
    setHelpful(true);
    setCount((prev) => prev + 1);

    // 2. Persist in local storage for fast client re-render
    try {
      localStorage.setItem(`review_helpful_${reviewId}`, "true");
    } catch {
      // ignore
    }

    // 3. Persist in PostgreSQL Database via Server Action
    startTransition(async () => {
      try {
        const res = await voteReviewHelpful(reviewId);
        if (res.ok && typeof res.count === "number") {
          setCount(res.count);
          setHelpful(true);
        }
      } catch {
        // Optimistic state remains intact if network blips
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={helpful || isPending}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
        helpful
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default"
          : "bg-stone-50 hover:bg-stone-100 text-slate-600 dark:bg-stone-900/60 dark:hover:bg-stone-850 dark:text-stone-300 border border-stone-200 dark:border-stone-800 active:scale-95 cursor-pointer"
      }`}
      aria-label="Mark review as helpful"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin text-emerald-600 dark:text-emerald-400" />
      ) : helpful ? (
        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <ThumbsUp className="h-3 w-3 text-slate-500 dark:text-stone-400" />
      )}
      <span>{helpful ? `Helpful (${count})` : count > 0 ? `Helpful (${count})` : "Helpful"}</span>
    </button>
  );
}
