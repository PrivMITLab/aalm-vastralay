"use client";

import React, { useMemo, useState } from "react";
import { getImageFallbackList, PLACEHOLDER_IMAGE } from "@/lib/image-resolver";
import type { DeliveryStrategy } from "@/types/media";

export interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  strategy?: DeliveryStrategy;
  mirroredUrl?: string;
  fallbacks?: string[];
  alt: string;
  width?: number;
  quality?: number;
}

/**
 * 👑 AALM VASTRALAY — SMART RESILIENT IMAGE COMPONENT
 * Provides automatic fallback chaining across delivery strategies (B2 -> wsrv -> direct -> placeholder).
 * If the active image fails or returns a 4xx/5xx/network error, it automatically falls back
 * to the next candidate in sequence without showing a broken icon or tracking user data.
 */
export function SmartImage({
  src,
  strategy = "wsrv",
  mirroredUrl,
  fallbacks = [],
  alt,
  width,
  quality,
  className,
  onError,
  ...restProps
}: SmartImageProps) {
  const fallbackChain = useMemo(() => {
    const computed = getImageFallbackList(src, { strategy, mirroredUrl, width, quality });
    // Append any explicit external fallbacks before placeholder
    const combined: string[] = [];
    for (const url of computed) {
      if (url !== PLACEHOLDER_IMAGE && !combined.includes(url)) combined.push(url);
    }
    for (const fb of fallbacks) {
      if (fb && fb !== PLACEHOLDER_IMAGE && !combined.includes(fb)) combined.push(fb);
    }
    combined.push(PLACEHOLDER_IMAGE);
    return combined;
  }, [src, strategy, mirroredUrl, width, quality, fallbacks]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first candidate whenever source or strategy changes.
  // Done during render (not in an effect) per React docs to avoid cascading renders.
  const resetKey = `${src}|${strategy}|${mirroredUrl ?? ""}`;
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setCurrentIndex(0);
  }

  const activeSrc = fallbackChain[currentIndex] || PLACEHOLDER_IMAGE;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentIndex < fallbackChain.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...restProps}
    />
  );
}

export default SmartImage;
