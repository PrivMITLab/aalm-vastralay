"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Check } from "lucide-react";

export default function ReviewHelpfulButton({
  reviewId,
  initialCount = 0,
}: {
  reviewId: string;
  initialCount?: number;
}) {
  const [helpful, setHelpful] = useState(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(`review_helpful_${reviewId}`);
        if (stored === "true") {
          setHelpful(true);
          setCount((prev) => (prev === 0 ? 1 : prev));
        }
      } catch {
        // ignore localStorage disabled
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [reviewId]);

  const handleToggle = () => {
    if (helpful) return;
    setHelpful(true);
    setCount((prev) => prev + 1);
    try {
      localStorage.setItem(`review_helpful_${reviewId}`, "true");
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={helpful}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
        helpful
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default"
          : "bg-stone-50 hover:bg-stone-100 text-slate-600 dark:bg-stone-900/60 dark:hover:bg-stone-850 dark:text-stone-300 border border-stone-200 dark:border-stone-800 active:scale-95"
      }`}
      aria-label="Mark review as helpful"
    >
      {helpful ? (
        <>
          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>Helpful ({count})</span>
        </>
      ) : (
        <>
          <ThumbsUp className="h-3 w-3 text-slate-500 dark:text-stone-400" />
          <span>Helpful {count > 0 ? `(${count})` : ""}</span>
        </>
      )}
    </button>
  );
}
