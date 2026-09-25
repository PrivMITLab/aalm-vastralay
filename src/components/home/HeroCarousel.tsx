"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Pause,
  Phone,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SmartImage } from "@/components/media/SmartImage";
import type { HeroSlide } from "@/types/media";

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const AUTOPLAY_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

/**
 * 👑 AALM VASTRALAY — 5-SLIDE AUTO-ROTATING HERO CAROUSEL
 * Flipkart / Myntra-grade auto-rotating carousel built with zero carousel libraries.
 * Features:
 * - GPU-composited translateX transform track (zero layout reflow, CLS = 0)
 * - 5s autoplay with auto-pause on hover, focus, or touch gestures
 * - Touch swipe support with 40px gesture threshold
 * - Accessible keyboard navigation (ArrowLeft / ArrowRight)
 * - 44px+ tap targets on arrows, dots, and pause/play controls
 * - Live polite screen-reader announcements (WCAG 2.1 AA)
 * - Respects prefers-reduced-motion: holds static slide unless manually paged
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  // Lazy initializer reads the OS setting during first render (no effect setState needed).
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const totalSlides = slides.length;

  // Subscribe to OS motion-preference changes only (initial value comes from lazy useState).
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex((prev) => {
      const target = (index + totalSlides) % totalSlides;
      return target;
    });
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [goToSlide, currentIndex]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [goToSlide, currentIndex]);

  // Autoplay timer
  useEffect(() => {
    if (totalSlides <= 1 || prefersReducedMotion || isPaused || isHovered || isFocused || isTouching) {
      return;
    }

    const timer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [totalSlides, prefersReducedMotion, isPaused, isHovered, isFocused, isTouching, currentIndex, goToSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsTouching(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsTouching(false);
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Only swipe if horizontal motion exceeds vertical scroll intent
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD_PX) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (totalSlides === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Collections Hero Carousel"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="group/carousel relative w-full overflow-hidden bg-gradient-to-br from-[#2a0845] via-[#4A148C] to-[#120024] text-white aspect-[16/10] sm:aspect-[21/9] min-h-[460px] sm:min-h-[520px] select-none"
    >
      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {totalSlides}: {currentSlide.title}
      </div>

      {/* Track: GPU-composited translateX */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          const isFirst = idx === 0;

          return (
            <div
              key={slide.id || `slide-${idx}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${totalSlides}: ${slide.title}`}
              aria-hidden={!isCurrent}
              className="relative h-full w-full shrink-0 flex items-center justify-center overflow-hidden"
            >
              {/* Background Backdrop Image via SmartImage with multi-stage fallback */}
              <SmartImage
                src={slide.image}
                strategy={slide.strategy || "wsrv"}
                mirroredUrl={slide.mirroredUrl}
                alt={slide.alt || slide.title}
                fetchPriority={isFirst ? "high" : "auto"}
                loading={isFirst ? "eager" : "lazy"}
                decoding={isFirst ? "sync" : "async"}
                width={1600}
                quality={75}
                className="absolute inset-0 h-full w-full object-cover object-center opacity-65 brightness-90 contrast-105 transition-transform duration-1000 ease-out"
              />

              {/* Multi-layered luxury royal purple & gold gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
              <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/70" />

              {/* Slide Content Box */}
              <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 py-8 sm:py-16">
                <div
                  key={`content-${currentIndex}`}
                  className="max-w-3xl space-y-3.5 sm:space-y-4 rounded-2xl sm:rounded-3xl border border-white/15 bg-black/45 p-5 sm:p-9 backdrop-blur-md shadow-2xl transition-all duration-500 transform-gpu motion-reduce:transform-none"
                >
                  {/* Eyebrow Badge */}
                  {slide.badge && (
                    <span className="inline-flex w-fit items-center gap-1.5 sm:gap-2 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/15 px-3 py-1 text-[11px] sm:text-xs font-bold tracking-widest text-[#D4AF37] uppercase shadow-sm">
                      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[#D4AF37] animate-pulse" />{" "}
                      {slide.badge}
                    </span>
                  )}

                  {/* Headline with Gold Accent Split */}
                  <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.2] tracking-tight drop-shadow-md">
                    <span className="block text-white font-serif">
                      {slide.title.includes("—") ? slide.title.split("—")[0]?.trim() : slide.title}
                    </span>
                    {slide.title.includes("—") && (
                      <span className="block bg-gradient-to-r from-[#FDE047] via-[#D4AF37] to-[#F59E0B] bg-clip-text text-transparent font-serif mt-1 text-xl sm:text-3xl lg:text-4xl">
                        — {slide.title.split("—")[1]?.trim()}
                      </span>
                    )}
                  </h1>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className="max-w-2xl text-xs sm:text-sm lg:text-base text-slate-200/95 leading-relaxed font-sans line-clamp-3">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                    {slide.ctaLabel && (
                      <Link
                        href={slide.ctaHref || "/products"}
                        className="btn btn-gold min-h-[48px] w-full sm:w-auto justify-center px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                      >
                        {slide.ctaLabel} <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                    {slide.cta2Label ? (
                      <Link
                        href={slide.cta2Href || "tel:8434061342"}
                        className="btn min-h-[48px] w-full sm:w-auto justify-center border border-[#D4AF37]/50 bg-black/40 text-amber-200 backdrop-blur hover:bg-[#D4AF37]/20 px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold inline-flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-[#D4AF37]" /> {slide.cta2Label}
                      </Link>
                    ) : (
                      <a
                        href="https://wa.me/918434061342?text=Namaste%20Aalm%20Vastralay,%20I%20am%20interested%20in%20your%20bridal/ethnic%20wear%20collection."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn min-h-[48px] w-full sm:w-auto justify-center border border-[#25D366]/60 bg-[#25D366]/20 text-white backdrop-blur hover:bg-[#25D366]/30 px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold inline-flex items-center gap-2"
                      >
                        <span>WhatsApp: 8434061342</span>
                      </a>
                    )}
                  </div>

                  {/* 4 Trust Feature Chips */}
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/10 text-[11px] sm:text-xs text-slate-200 font-medium">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0" />
                      <span className="truncate">Cash on Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0" />
                      <span className="truncate">7-Day Returns</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0" />
                      <span className="truncate">Verified Artisans</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <BadgePercent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37] shrink-0" />
                      <span className="truncate">Free Shipping &gt; ₹999</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls: Previous / Next 44px Touch Targets */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:border-[#D4AF37] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] z-20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:border-[#D4AF37] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] z-20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Bottom Bar: Indicators & Pause/Play Controls */}
      {totalSlides > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2 sm:gap-3">
          {/* Slide Indicator Dots (44px target box with clean visible pill) */}
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-1 backdrop-blur-md">
            {slides.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1} of ${totalSlides}`}
                aria-current={currentIndex === i ? "true" : undefined}
                className="grid h-11 w-9 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    currentIndex === i
                      ? "h-2 w-7 bg-[#D4AF37] shadow-sm shadow-[#D4AF37]/50"
                      : "h-2 w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Autoplay Pause / Play Toggle (44px) */}
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? "Start automatic slide rotation" : "Pause automatic slide rotation"}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/40 text-white/90 backdrop-blur-md transition hover:bg-black/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default HeroCarousel;
