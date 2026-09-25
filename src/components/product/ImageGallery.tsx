"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImageGallery({
  images,
  title,
  video,
}: {
  images: string[];
  title: string;
  video: { type: "youtube" | "file"; url: string } | null;
}) {
  const [active, setActive] = useState(0);
  const showVideo = video && active === images.length;

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {(images.length > 1 || video) && (
        <div className="flex gap-2 overflow-x-auto md:w-20 md:flex-col md:overflow-y-auto">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-150 active:scale-95 shadow-2xs",
                active === i
                  ? "border-maroon-700 dark:border-gold-400 ring-2 ring-maroon-700/25 dark:ring-gold-400/40"
                  : "border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:border-maroon-400 dark:hover:border-gold-400/50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${title} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
          {video && (
            <button
              type="button"
              onClick={() => setActive(images.length)}
              className={cn(
                "grid h-20 w-16 shrink-0 place-items-center rounded-xl border-2 bg-maroon-900 text-white transition-all active:scale-95 shadow-2xs",
                showVideo ? "border-gold-400 ring-2 ring-gold-400/40" : "border-stone-700 hover:border-gold-400/60",
              )}
              aria-label="Play video"
            >
              <PlayCircle className="h-7 w-7" />
            </button>
          )}
        </div>
      )}

      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-2xl border border-cream-200 dark:border-stone-700/80 bg-cream-50 dark:bg-stone-900/80 shadow-xs">
        {showVideo ? (
          video.type === "youtube" ? (
            <iframe src={video.url} title={`${title} video`} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen />
          ) : (
            <video src={video.url} controls className="h-full w-full object-cover" />
          )
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[active] ?? images[0]} alt={title} className="h-full w-full object-cover" />
        )}
      </div>
    </div>
  );
}
