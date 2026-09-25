"use client";

import React, { useId, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Cloud,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  HardDrive,
  Image as ImageIcon,
  Layers,
  Loader2,
  Megaphone,
  Radio,
  RefreshCw,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from "lucide-react";
import { updateSettingsDirect } from "@/actions/admin";
import { canonicalizeImageUrl, resolveImage } from "@/lib/image-resolver";
import type { DeliveryStrategy, HeroSlide } from "@/types/media";

interface BannerEditorProps {
  initialBanner: {
    url?: string;
    badge?: string;
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
    ctaHref?: string;
    height?: number;
    overlay?: number;
    strategy?: DeliveryStrategy;
    mirroredUrl?: string;
  };
  initialSlides?: HeroSlide[];
  initialMirroredBytes?: number;
  initialAnnouncement: string;
  initialMarquee: string;
}

const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB Free Tier

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    image: "/brand/poster.png",
    title: "Royal Indian Wedding & Luxury Ethnic Wear",
    subtitle: "Exquisite Banarasi sarees, handloom silks, bridal lehengas, and regal sherwanis.",
    badge: "Couture 2026",
    ctaLabel: "Explore Collections",
    ctaHref: "/products",
    cta2Label: "Call Showroom",
    cta2Href: "tel:8434061342",
    alt: "Royal Ethnic Collection",
    active: true,
    order: 0,
    strategy: "wsrv",
  },
  {
    id: "slide-2",
    image: "/brand/poster.png",
    title: "Pure Banarasi & Heritage Handloom Sarees",
    subtitle: "Woven by master heritage artisans with authentic gold zari and pure silk.",
    badge: "Varanasi Silk",
    ctaLabel: "Shop Silk Sarees",
    ctaHref: "/products",
    cta2Label: "WhatsApp Consult",
    cta2Href: "https://wa.me/918434061342",
    alt: "Pure Banarasi Silk Sarees",
    active: true,
    order: 1,
    strategy: "wsrv",
  },
  {
    id: "slide-3",
    image: "/brand/poster.png",
    title: "Imperial Bridal Lehengas & Gowns",
    subtitle: "Hand-embroidered zardozi and gota patti bridal ensembles for royal celebrations.",
    badge: "Bridal Couture",
    ctaLabel: "View Bridal Wear",
    ctaHref: "/products",
    cta2Label: "Stylist Consult",
    cta2Href: "tel:8434061342",
    alt: "Imperial Bridal Lehengas",
    active: true,
    order: 2,
    strategy: "wsrv",
  },
  {
    id: "slide-4",
    image: "/brand/poster.png",
    title: "Regal Groom Sherwanis & Kurtas",
    subtitle: "Tailored to perfection with royal silhouettes, brooches, and silk stoles.",
    badge: "Men's Wedding",
    ctaLabel: "Explore Sherwanis",
    ctaHref: "/products",
    cta2Label: "Boutique Visit",
    cta2Href: "tel:8434061342",
    alt: "Regal Groom Sherwanis",
    active: true,
    order: 3,
    strategy: "wsrv",
  },
  {
    id: "slide-5",
    image: "/brand/poster.png",
    title: "Festive Family & Celebratory Wear",
    subtitle: "Matching ethnic ensembles for festivals, weddings, and family celebrations.",
    badge: "Family Festive",
    ctaLabel: "All Collections",
    ctaHref: "/products",
    cta2Label: "Track Order",
    cta2Href: "/track-order",
    alt: "Festive Family Collections",
    active: true,
    order: 4,
    strategy: "wsrv",
  },
];

export default function BannerEditor({
  initialBanner,
  initialSlides,
  initialMirroredBytes = 0,
  initialAnnouncement,
  initialMarquee,
}: BannerEditorProps) {
  const [activeTab, setActiveTab] = useState<"carousel" | "single" | "tickers">("carousel");

  // --- Slides State (Max 5) ---
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    if (initialSlides && initialSlides.length > 0) {
      // Pad to 5 slots if fewer
      const padded = [...initialSlides];
      while (padded.length < 5) {
        const idx = padded.length;
        padded.push({
          ...DEFAULT_SLIDES[idx],
          id: `slide-${idx + 1}`,
          order: idx,
        });
      }
      return padded.slice(0, 5);
    }
    return DEFAULT_SLIDES;
  });

  // --- Bulk URL Import ---
  const [bulkUrlInput, setBulkUrlInput] = useState("");
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  // --- Storage Meter State ---
  const [mirroredBytes, setMirroredBytes] = useState(initialMirroredBytes);
  const [mirroringIndex, setMirroringIndex] = useState<number | null>(null);
  const [mirrorError, setMirrorError] = useState<{ index: number; msg: string } | null>(null);

  // --- Legacy Single Banner State ---
  const [bannerUrl, setBannerUrl] = useState(initialBanner.url ?? "");
  const [bannerBadge, setBannerBadge] = useState(initialBanner.badge ?? "Aalm Vastralay · Kalyanipur");
  const [bannerTitle, setBannerTitle] = useState(initialBanner.title ?? "Royal Indian Wedding & Luxury Ethnic Wear");
  const [bannerSubtitle, setBannerSubtitle] = useState(
    initialBanner.subtitle ?? "Exquisite Banarasi sarees, handloom silks, bridal lehengas, and regal sherwanis."
  );
  const [bannerCtaLabel, setBannerCtaLabel] = useState(initialBanner.ctaLabel ?? "Explore Collections");
  const [bannerCtaHref, setBannerCtaHref] = useState(initialBanner.ctaHref ?? "/products?category=women");
  const [announcementText, setAnnouncementText] = useState(initialAnnouncement);
  const [marqueeText, setMarqueeText] = useState(initialMarquee);

  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // --- Bulk URL Distribution Handler ---
  const handleBulkDistribute = () => {
    if (!bulkUrlInput.trim()) {
      setBulkFeedback("कृपया पहले एक या अधिक इमेज लिंक पेस्ट करें (Please paste one or more image links first).");
      return;
    }

    // Split by comma, newlines, or tabs
    const rawTokens = bulkUrlInput
      .split(/[\n,\t]+/)
      .map((t) => t.trim())
      .filter((t) => Boolean(t && (t.startsWith("http") || t.startsWith("/") || /^[a-zA-Z0-9_-]{28,45}$/.test(t))));

    if (rawTokens.length === 0) {
      setBulkFeedback("कोई वैध इमेज लिंक नहीं मिला (No valid image URLs detected).");
      return;
    }

    setSlides((prev) => {
      const next = [...prev];
      rawTokens.slice(0, 5).forEach((url, i) => {
        const canonical = canonicalizeImageUrl(url);
        next[i] = {
          ...next[i],
          image: canonical || url,
          active: true,
        };
      });
      return next;
    });

    setBulkFeedback(`✨ ${Math.min(rawTokens.length, 5)} इमेज लिंक सफलतापूर्वक 5 स्लाइड्स में जोड़ दिए गए! (${Math.min(rawTokens.length, 5)} links distributed)`);
    setBulkUrlInput("");
    setTimeout(() => setBulkFeedback(null), 6000);
  };

  // --- Slide Updates ---
  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const moveSlide = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      // Re-assign order indices
      return copy.map((s, i) => ({ ...s, order: i }));
    });
  };

  // --- 1-Click B2 Mirror Trigger ---
  const handleMirrorSlide = async (idx: number) => {
    const targetSlide = slides[idx];
    if (!targetSlide.image || !targetSlide.image.startsWith("http")) {
      setMirrorError({ index: idx, msg: "केवल वैध HTTP/HTTPS इमेज लिंक ही B2 में मिरर किए जा सकते हैं।" });
      return;
    }

    setMirroringIndex(idx);
    setMirrorError(null);

    try {
      const res = await fetch("/api/admin/mirror-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetSlide.image }),
      });
      const data = await res.json();

      if (data.success && data.mirroredUrl) {
        updateSlide(idx, {
          mirroredUrl: data.mirroredUrl,
          mirroredBytes: data.bytes,
          mirroredAt: data.mirroredAt,
          strategy: "b2",
        });
        if (data.totalMirroredBytes) {
          setMirroredBytes(data.totalMirroredBytes);
        }
      } else {
        setMirrorError({ index: idx, msg: data.error || "Mirror failed. Please check the image link." });
      }
    } catch {
      setMirrorError({ index: idx, msg: "Server connection failed during mirroring." });
    } finally {
      setMirroringIndex(null);
    }
  };

  // --- Save Form Handler ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    const formData = new FormData();
    formData.append("__group", "home");

    // Save 5 Slides as JSON string
    const sanitizedSlides = slides.slice(0, 5).map((sl, i) => ({
      ...sl,
      order: i,
      image: canonicalizeImageUrl(sl.image) || sl.image,
    }));
    formData.append("home.slides", JSON.stringify(sanitizedSlides));

    // Save Legacy Banner values
    formData.append("home.bannerUrl", canonicalizeImageUrl(bannerUrl) || bannerUrl);
    formData.append("home.bannerBadge", bannerBadge);
    formData.append("home.bannerTitle", bannerTitle);
    formData.append("home.bannerSubtitle", bannerSubtitle);
    formData.append("home.bannerCtaLabel", bannerCtaLabel);
    formData.append("home.bannerCtaHref", bannerCtaHref);
    formData.append("home.announcementText", announcementText);
    formData.append("home.marqueeText", marqueeText);

    startTransition(async () => {
      try {
        await updateSettingsDirect(formData);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } catch (err: unknown) {
        console.error("[BannerEditor Save Error]:", err);
        setSaveError("Failed to save changes. Please verify fields and try again.");
      }
    });
  };

  const mirroredMB = (mirroredBytes / (1024 * 1024)).toFixed(1);
  const totalLimitMB = (MAX_STORAGE_BYTES / (1024 * 1024)).toFixed(0);
  const storagePercentage = Math.min(100, Math.round((mirroredBytes / MAX_STORAGE_BYTES) * 100));

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-[color:var(--border)] gap-2 pb-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("carousel")}
          className={`flex min-h-[44px] items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-colors ${
            activeTab === "carousel"
              ? "bg-[color:var(--brand)] text-white shadow-sm"
              : "text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)]"
          }`}
        >
          <Layers className="h-4 w-4" /> 5-Slide Hero Carousel (Flipkart/Myntra)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("single")}
          className={`flex min-h-[44px] items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-colors ${
            activeTab === "single"
              ? "bg-[color:var(--brand)] text-white shadow-sm"
              : "text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)]"
          }`}
        >
          <ImageIcon className="h-4 w-4" /> Single Banner (Legacy Fallback)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tickers")}
          className={`flex min-h-[44px] items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-colors ${
            activeTab === "tickers"
              ? "bg-[color:var(--brand)] text-white shadow-sm"
              : "text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)]"
          }`}
        >
          <Megaphone className="h-4 w-4" /> Ticker &amp; Marquee
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ============================================================== */}
        {/* TAB 1: 5-SLIDE HERO CAROUSEL */}
        {/* ============================================================== */}
        {activeTab === "carousel" && (
          <div className="space-y-6">
            {/* Storage Meter Bar */}
            <div className="card p-4 sm:p-5 border border-[color:var(--border)] bg-gradient-to-r from-[color:var(--surface)] via-[color:var(--surface-2)] to-[color:var(--surface)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-[color:var(--accent)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand)]">
                    Backblaze B2 Mirror Storage Meter / मिरर स्टोरेज मीटर
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-[color:var(--text)]">
                  {mirroredMB} MB / {totalLimitMB} MB ({storagePercentage}% of 10GB Free Tier)
                </span>
              </div>
              <div className="w-full bg-[color:var(--surface-3)] h-2.5 rounded-full overflow-hidden border border-[color:var(--border)]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-amber-500 transition-all duration-500"
                  style={{ width: `${Math.max(2, storagePercentage)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[color:var(--text-soft)]">
                1-Click Mirror copies external images directly to Backblaze B2 so your store never suffers from broken links.
              </p>
            </div>

            {/* Bulk Links Importer Box */}
            <div className="card p-5 border-2 border-dashed border-[#D4AF37]/50 bg-[#D4AF37]/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-[#D4AF37]" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[color:var(--brand)]">
                    Bulk Image Links / एकाधिक लिंक (Google Drive, Dropbox, Direct URLs)
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-[#D4AF37]">Auto-distributes to 5 slides</span>
              </div>

              <textarea
                value={bulkUrlInput}
                onChange={(e) => setBulkUrlInput(e.target.value)}
                rows={3}
                placeholder="Paste multiple URLs separated by comma or new lines, e.g.:
https://lh3.googleusercontent.com/d/1cCzmA3yLZgIAKzrGBOBv32ef4PZhScGQ,
https://lh3.googleusercontent.com/d/2...,
https://example.com/banner.webp"
                className="input w-full font-mono text-xs leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBulkDistribute}
                  className="btn btn-gold text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Parse &amp; Distribute across 5 Slides / लिंक बाँटें
                </button>
                {bulkFeedback && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {bulkFeedback}
                  </span>
                )}
              </div>
            </div>

            {/* 5 Slide Slots */}
            <div className="space-y-6">
              {slides.map((slide, idx) => {
                const previewSrc = resolveImage(slide.image, {
                  strategy: slide.strategy || "wsrv",
                  mirroredUrl: slide.mirroredUrl,
                });

                return (
                  <div
                    key={slide.id || `slot-${idx}`}
                    className={`card p-5 border transition-all ${
                      slide.active
                        ? "border-[color:var(--border)] shadow-md"
                        : "border-[color:var(--border)]/40 opacity-70 bg-[color:var(--surface-2)]"
                    }`}
                  >
                    {/* Slot Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--brand)] text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <h4 className="font-display text-sm font-bold text-[color:var(--brand)]">
                          Slide #{idx + 1}: {slide.title || "Untitled Slide"}
                        </h4>
                        {slide.strategy && (
                          <span className="rounded-full bg-[color:var(--accent)]/15 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37] uppercase border border-[#D4AF37]/30">
                            via {slide.strategy}
                          </span>
                        )}
                        {slide.mirroredUrl && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase border border-emerald-500/30">
                            B2 Mirrored • {slide.mirroredBytes ? `${(slide.mirroredBytes / 1024).toFixed(0)} KB` : "Stored"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Order Controls */}
                        <button
                          type="button"
                          onClick={() => moveSlide(idx, "up")}
                          disabled={idx === 0}
                          className="h-8 w-8 grid place-items-center rounded-lg border border-[color:var(--border)] text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)] disabled:opacity-30"
                          aria-label="Move slide up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSlide(idx, "down")}
                          disabled={idx === slides.length - 1}
                          className="h-8 w-8 grid place-items-center rounded-lg border border-[color:var(--border)] text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)] disabled:opacity-30"
                          aria-label="Move slide down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>

                        {/* Active Toggle */}
                        <label className="flex items-center gap-1.5 cursor-pointer ml-2">
                          <input
                            type="checkbox"
                            checked={slide.active}
                            onChange={(e) => updateSlide(idx, { active: e.target.checked })}
                            className="checkbox h-4 w-4 rounded"
                          />
                          <span className="text-xs font-semibold text-[color:var(--text)]">
                            {slide.active ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-12">
                      {/* Left: Live Mini-Preview */}
                      <div className="lg:col-span-4 space-y-2">
                        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[color:var(--border)] bg-slate-950 flex items-center justify-center shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewSrc}
                            alt={slide.title || "Preview"}
                            className="absolute inset-0 h-full w-full object-cover opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="relative z-10 p-3 text-white text-center space-y-1">
                            {slide.badge && (
                              <span className="inline-block rounded-full bg-[#D4AF37] px-2 py-0.5 text-[9px] font-bold text-slate-950 uppercase">
                                {slide.badge}
                              </span>
                            )}
                            <p className="font-serif text-xs font-bold line-clamp-1">{slide.title}</p>
                            <p className="text-[10px] text-slate-300 line-clamp-1">{slide.subtitle}</p>
                          </div>
                        </div>

                        <div className="text-[11px] text-[color:var(--text-soft)] flex items-center justify-between">
                          <span>Preview resolution</span>
                          <span className="font-mono text-[10px] text-[#D4AF37] truncate max-w-[180px]">
                            {slide.strategy === "b2" ? "B2 Cloud Storage" : slide.strategy === "direct" ? "Direct Canonical" : "Fast WebP (wsrv.nl)"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Slot Controls */}
                      <div className="lg:col-span-8 space-y-4">
                        {/* Image URL input with Canonicalizer */}
                        <div>
                          <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">
                            Image URL / इमेज लिंक (Supports Google Drive ID, lh3, Dropbox, Direct)
                          </label>
                          <input
                            type="text"
                            value={slide.image}
                            onChange={(e) => {
                              const cleaned = canonicalizeImageUrl(e.target.value);
                              updateSlide(idx, { image: cleaned || e.target.value });
                            }}
                            placeholder="https://lh3.googleusercontent.com/d/..."
                            className="input w-full text-xs font-mono"
                          />
                        </div>

                        {/* 4 Delivery Strategy Radio Cards */}
                        <div>
                          <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1.5">
                            Delivery Strategy / इमेज वितरण रणनीति
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              {
                                id: "wsrv",
                                label: "wsrv-halka",
                                hint: "tez/paraya-server",
                                desc: "Cloudflare WebP cache",
                              },
                              {
                                id: "direct",
                                label: "GDrive-seedha",
                                hint: "bhari/slow",
                                desc: "Original direct stream",
                              },
                              {
                                id: "b2",
                                label: "B2-mirror",
                                hint: "pakka/apna-ghar",
                                desc: "Permanent B2 storage",
                              },
                              {
                                id: "auto",
                                label: "Auto-hybrid",
                                hint: "kabhi-khali-nahi",
                                desc: "B2 first, fallback wsrv",
                              },
                            ].map((strat) => {
                              const isSelected = (slide.strategy || "wsrv") === strat.id;
                              return (
                                <button
                                  key={strat.id}
                                  type="button"
                                  onClick={() => updateSlide(idx, { strategy: strat.id as DeliveryStrategy })}
                                  className={`min-h-[44px] flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                                    isSelected
                                      ? "border-[#D4AF37] bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]"
                                      : "border-[color:var(--border)] hover:bg-[color:var(--surface-2)]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-bold text-[color:var(--text)]">{strat.label}</span>
                                    {isSelected && <Check className="h-3 w-3 text-[#D4AF37]" />}
                                  </div>
                                  <span className="text-[10px] text-[#D4AF37] font-medium mt-0.5">{strat.hint}</span>
                                  <span className="text-[9px] text-[color:var(--text-soft)]">{strat.desc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 1-Click B2 Mirror Button */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => handleMirrorSlide(idx)}
                            disabled={mirroringIndex === idx || !slide.image.startsWith("http")}
                            className="btn btn-outline min-h-[44px] text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
                          >
                            {mirroringIndex === idx ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D4AF37]" />
                                <span>Mirroring to B2…</span>
                              </>
                            ) : (
                              <>
                                <Cloud className="h-3.5 w-3.5 text-[#D4AF37]" />
                                <span>☁️ 1-Click Mirror to B2 / B2 में कॉपी करें</span>
                              </>
                            )}
                          </button>

                          {slide.mirroredUrl && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" />
                              <span>Permanently stored on Backblaze B2</span>
                            </span>
                          )}

                          {mirrorError && mirrorError.index === idx && (
                            <span className="text-xs text-rose-500 font-medium">
                              ⚠️ {mirrorError.msg}
                            </span>
                          )}
                        </div>

                        {/* Slide Title & Badge */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-[color:var(--text-soft)] mb-1">
                              Headline / मुख्य शीर्षक (Max 120 chars)
                            </label>
                            <input
                              type="text"
                              maxLength={120}
                              value={slide.title}
                              onChange={(e) => updateSlide(idx, { title: e.target.value })}
                              className="input w-full text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[color:var(--text-soft)] mb-1">
                              Eyebrow Badge / बैज (e.g. Wedding Couture)
                            </label>
                            <input
                              type="text"
                              maxLength={50}
                              value={slide.badge}
                              onChange={(e) => updateSlide(idx, { badge: e.target.value })}
                              className="input w-full text-xs"
                            />
                          </div>
                        </div>

                        {/* Slide Subtitle */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[color:var(--text-soft)] mb-1">
                            Subtitle / उपशीर्षक (Max 300 chars)
                          </label>
                          <textarea
                            rows={2}
                            maxLength={300}
                            value={slide.subtitle}
                            onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                            className="input w-full text-xs leading-relaxed"
                          />
                        </div>

                        {/* CTAs */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-[color:var(--text-soft)] mb-1">
                              Primary CTA Label &amp; Link
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                value={slide.ctaLabel}
                                onChange={(e) => updateSlide(idx, { ctaLabel: e.target.value })}
                                placeholder="Button Text"
                                className="input w-full text-xs"
                              />
                              <input
                                type="text"
                                value={slide.ctaHref}
                                onChange={(e) => updateSlide(idx, { ctaHref: e.target.value })}
                                placeholder="/products"
                                className="input w-full text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[color:var(--text-soft)] mb-1">
                              Secondary CTA Label &amp; Link
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                value={slide.cta2Label || ""}
                                onChange={(e) => updateSlide(idx, { cta2Label: e.target.value })}
                                placeholder="Call / WhatsApp"
                                className="input w-full text-xs"
                              />
                              <input
                                type="text"
                                value={slide.cta2Href || ""}
                                onChange={(e) => updateSlide(idx, { cta2Href: e.target.value })}
                                placeholder="tel:... or wa.me"
                                className="input w-full text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SINGLE HERO BANNER (LEGACY FALLBACK) */}
        {/* ============================================================== */}
        {activeTab === "single" && (
          <div className="card p-6 border border-[color:var(--border)] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand)] flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[color:var(--accent)]" /> Single Hero Banner (Legacy Fallback)
            </h3>
            <p className="text-xs text-[color:var(--text-soft)]">
              This banner displays whenever carousel slides are disabled or empty.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">
                Banner Image URL
              </label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => {
                  const cleaned = canonicalizeImageUrl(e.target.value);
                  setBannerUrl(cleaned || e.target.value);
                }}
                className="input w-full text-xs font-mono"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">Badge</label>
                <input
                  type="text"
                  value={bannerBadge}
                  onChange={(e) => setBannerBadge(e.target.value)}
                  className="input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">Button CTA Text</label>
                <input
                  type="text"
                  value={bannerCtaLabel}
                  onChange={(e) => setBannerCtaLabel(e.target.value)}
                  className="input w-full text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">Main Title</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="input w-full text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">Button CTA Link</label>
                <input
                  type="text"
                  value={bannerCtaHref}
                  onChange={(e) => setBannerCtaHref(e.target.value)}
                  className="input w-full text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                className="input w-full text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: TICKERS & MARQUEE */}
        {/* ============================================================== */}
        {activeTab === "tickers" && (
          <div className="card p-6 border border-[color:var(--border)] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand)] flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[color:var(--accent)]" /> Announcement Bar &amp; Scrolling Ticker
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">
                  Top Announcement Bar Message
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[color:var(--text-soft)] mb-1">
                  Scrolling Marquee Ticker Message
                </label>
                <input
                  type="text"
                  value={marqueeText}
                  onChange={(e) => setMarqueeText(e.target.value)}
                  className="input w-full text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BOTTOM SAVE CONTROLS */}
        {/* ============================================================== */}
        <div className="card p-4 border border-[color:var(--border)] flex flex-wrap items-center justify-between gap-3 bg-[color:var(--surface-2)]">
          {saveSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <Check className="h-4 w-4" /> Carousel &amp; promotional settings saved and published live!
            </span>
          ) : saveError ? (
            <span className="text-xs font-bold text-rose-500">{saveError}</span>
          ) : (
            <span className="text-xs text-[color:var(--text-soft)]">
              All 5 slides will immediately synchronize with homepage visitors across mobile and desktop.
            </span>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary min-h-[44px] text-xs font-bold px-6 py-2.5 flex items-center gap-2 active:scale-95 transition-transform"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Slides &amp; Banners…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#D4AF37]" /> Save All Slides &amp; Banners
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
