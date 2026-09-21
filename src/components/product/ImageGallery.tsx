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
              className={cn("h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-cream-100", active === i ? "border-maroon-700" : "border-transparent")}
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
                "grid h-20 w-16 shrink-0 place-items-center rounded-lg border-2 bg-maroon-900 text-white",
                showVideo ? "border-gold-500" : "border-transparent",
              )}
              aria-label="Play video"
            >
              <PlayCircle className="h-7 w-7" />
            </button>
          )}
        </div>
      )}

      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-2xl border border-cream-200 bg-cream-100">
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
