"use client";

import React, { useState, useTransition } from "react";
import { Check, ExternalLink, Globe, Image as ImageIcon, Loader2, Megaphone, Sparkles, Wand2 } from "lucide-react";
import { updateSettingsDirect } from "@/actions/admin";
import { canonicalizeImageUrl, resolveImage } from "@/lib/image-resolver";

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
  };
  initialAnnouncement: string;
  initialMarquee: string;
}

export default function BannerEditor({
  initialBanner,
  initialAnnouncement,
  initialMarquee,
}: BannerEditorProps) {
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

  const [isScraping, setIsScraping] = useState(false);
  const [scrapeFeedback, setScrapeFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute live resolved preview image
  const resolvedPreviewUrl = resolveImage(bannerUrl || "/brand/poster.png");
  const isGoogleDrive = /drive\.google\.com|docs\.google\.com|lh3\.googleusercontent\.com/.test(bannerUrl);
  const isDropbox = /dropbox\.com/.test(bannerUrl);

  const handleUrlChange = (val: string) => {
    setImgError(false);
    setScrapeFeedback(null);
    const cleaned = canonicalizeImageUrl(val);
    setBannerUrl(cleaned || val);
  };

  const handleScrape = async () => {
    if (!bannerUrl.trim()) {
      setScrapeFeedback({ type: "error", text: "Please enter a URL first." });
      return;
    }

    setIsScraping(true);
    setScrapeFeedback(null);
    setImgError(false);

    try {
      const res = await fetch(`/api/admin/scrape-image?url=${encodeURIComponent(bannerUrl.trim())}`);
      const data = await res.json();

      if (data.ok && data.imageUrl) {
        setBannerUrl(data.imageUrl);
        setScrapeFeedback({
          type: "success",
          text: data.source === "canonicalized"
            ? "✨ Link auto-converted to direct CDN image stream!"
            : "✨ Successfully scraped high-res banner image from webpage!",
        });
      } else {
        setScrapeFeedback({
          type: "error",
          text: data.error || "Could not scrape image from this URL. Please verify the link.",
        });
      }
    } catch {
      setScrapeFeedback({
        type: "error",
        text: "Failed to connect to image scraper service. Check the URL.",
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateSettingsDirect(formData);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } catch (err) {
        alert("Failed to save banner settings. Check console for details.");
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="card overflow-hidden border-2 border-[color:var(--border)] shadow-xl">
        <div className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Live Hero Banner Preview (Real-Time Synchronized)
          </span>
          <span className="text-[10px] lowercase font-mono text-[color:var(--text-soft)]">
            {isGoogleDrive ? "google-drive-cdn" : isDropbox ? "dropbox-raw" : "direct-image"}
          </span>
        </div>

        <div className="relative min-h-[260px] sm:min-h-[320px] bg-slate-950 p-6 sm:p-10 flex flex-col justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={resolvedPreviewUrl}
            src={imgError ? "/brand/poster.png" : resolvedPreviewUrl}
            alt="Hero Banner Preview"
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
            className="absolute inset-0 h-full w-full object-cover opacity-50 transition-opacity duration-700"
          />

          {/* Luxury royal purple gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/95 via-purple-900/70 to-transparent" />
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60" />

          {/* Content Box */}
          <div className="relative z-10 max-w-xl space-y-3 text-white">
            {bannerBadge && (
              <span className="inline-block rounded-full bg-[color:var(--accent)] px-3 py-0.5 text-[11px] font-bold text-slate-950 tracking-wider uppercase shadow-md">
                {bannerBadge}
              </span>
            )}
            <h2 className="font-display text-2xl font-bold sm:text-3xl lg:text-4xl text-white leading-tight drop-shadow-md">
              {bannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-md drop-shadow">
              {bannerSubtitle}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--accent)] px-5 py-2 text-xs font-bold text-slate-950 shadow-lg cursor-pointer">
                {bannerCtaLabel} →
              </span>
              {bannerCtaHref && (
                <span className="text-[11px] text-white/70 font-mono flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> {bannerCtaHref}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Notices */}
        {imgError && (
          <div className="bg-amber-500/10 border-t border-amber-500/30 px-4 py-2.5 text-xs text-amber-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>Image Load Warning:</strong> Image could not be loaded directly. If using Google Drive, ensure sharing is set to <em>&quot;Anyone with the link can view&quot;</em>. Displaying default brand poster.
            </span>
          </div>
        )}

        {isGoogleDrive && !imgError && (
          <div className="bg-emerald-500/10 border-t border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>Google Drive sharing link successfully converted into direct high-speed CDN image stream.</span>
          </div>
        )}
      </div>

      {/* Banner Configuration Form */}
      <div className="card p-6 border border-[color:var(--border)]">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand)] mb-4 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-[color:var(--accent)]" /> Hero Banner Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="__group" value="home" />

          {/* Image URL with Scrape Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[color:var(--text-soft)]">
                Banner Image URL (Google Drive, Dropbox, Direct WebP/JPG or any Webpage)
              </label>
              <span className="text-[11px] text-[color:var(--text-soft)]">Supports any URL</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                name="home.bannerUrl"
                value={bannerUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view or https://example.com/banner.jpg"
                className="input flex-1 text-sm font-mono"
              />
              <button
                type="button"
                onClick={handleScrape}
                disabled={isScraping || !bannerUrl.trim()}
                className="btn btn-outline text-xs px-3.5 py-2 flex items-center gap-1.5 shrink-0"
                title="Automatically extract and scrape high-res image from any URL or webpage"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scraping…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Auto-Detect / Scrape
                  </>
                )}
              </button>
            </div>

            {scrapeFeedback && (
              <p
                className={`mt-1.5 text-xs font-medium ${
                  scrapeFeedback.type === "success" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {scrapeFeedback.text}
              </p>
            )}

            <p className="mt-1 text-[11px] text-[color:var(--text-soft)]">
              💡 <strong>Supported:</strong> Google Drive links (any format), Dropbox, Unsplash, Pinterest, raw web URLs, or any webpage link (clicks &quot;Auto-Detect&quot; to scrape its OpenGraph banner).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Banner Badge Text
              </label>
              <input
                type="text"
                name="home.bannerBadge"
                value={bannerBadge}
                onChange={(e) => setBannerBadge(e.target.value)}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Button CTA Text
              </label>
              <input
                type="text"
                name="home.bannerCtaLabel"
                value={bannerCtaLabel}
                onChange={(e) => setBannerCtaLabel(e.target.value)}
                className="input w-full text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Banner Main Title
              </label>
              <input
                type="text"
                name="home.bannerTitle"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="input w-full text-sm font-semibold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Button CTA Link URL
              </label>
              <input
                type="text"
                name="home.bannerCtaHref"
                value={bannerCtaHref}
                onChange={(e) => setBannerCtaHref(e.target.value)}
                className="input w-full text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
              Banner Subtitle / Description
            </label>
            <textarea
              name="home.bannerSubtitle"
              rows={2}
              value={bannerSubtitle}
              onChange={(e) => setBannerSubtitle(e.target.value)}
              className="input w-full text-sm leading-relaxed"
            />
          </div>

          <hr className="my-5 border-[color:var(--border)]" />

          {/* Announcement & Marquee */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand)] flex items-center gap-1.5">
            <Megaphone className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Announcement & Marquee Ticker
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Top Announcement Bar
              </label>
              <input
                type="text"
                name="home.announcementText"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[color:var(--text-soft)]">
                Scrolling Marquee Ticker
              </label>
              <input
                type="text"
                name="home.marqueeText"
                value={marqueeText}
                onChange={(e) => setMarqueeText(e.target.value)}
                className="input w-full text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <Check className="h-4 w-4" /> Hero banner & marquee settings saved and published live!
              </span>
            ) : (
              <span className="text-xs text-[color:var(--text-soft)]">
                Changes will take effect immediately across all devices.
              </span>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-sm px-6 py-2.5 flex items-center gap-2 active:scale-95 transition-transform"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[color:var(--accent)]" /> Save Banner Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
