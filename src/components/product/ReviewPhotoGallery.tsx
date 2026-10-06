"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { SmartImage } from "@/components/media/SmartImage";

export default function ReviewPhotoGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Handle keyboard shortcuts (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (selectedIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIndex(idx)}
            className="group relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl border border-[color:var(--border)] bg-cream-50 dark:bg-stone-900 shadow-2xs transition-all duration-200 hover:scale-105 hover:border-gold-500 hover:shadow-md cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-gold-500/60"
            title="Click to view full photo"
            aria-label={`View full customer photo ${idx + 1}`}
          >
            <SmartImage
              src={img}
              alt={`Customer photo ${idx + 1}`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
              width={160}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
            </div>
          </button>
        ))}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Counter and Close Button */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-medium tracking-wider uppercase text-gold-300">
                Customer Photo {selectedIndex + 1} of {images.length}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                aria-label="Close photo preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Active Image View */}
            <div className="relative aspect-auto max-h-[75vh] w-full overflow-hidden rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl">
              <SmartImage
                src={images[selectedIndex]}
                alt={`Customer review photo ${selectedIndex + 1}`}
                className="max-h-[75vh] w-auto max-w-full object-contain"
                width={1200}
              />

              {/* Prev / Next Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white shadow-md transition active:scale-90"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white shadow-md transition active:scale-90"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip for Multi-Image Reviews */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto max-w-full py-1">
                {images.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative h-12 w-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      idx === selectedIndex ? "border-gold-400 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <SmartImage
                      src={thumb}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                      width={80}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
