"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

const CONSENT_KEY = "av_cookie_consent_v1";

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        // Show after a brief delay for smooth entrance
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  const saveConsent = (prefs: ConsentPreferences) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-fade-up rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-4 shadow-2xl backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
          <Cookie className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[color:var(--text)]">
              Privacy & Cookie Preferences
            </h3>
            <button
              onClick={handleEssentialOnly}
              className="text-[color:var(--text-soft)] hover:text-[color:var(--text)]"
              aria-label="Dismiss cookie notice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-[color:var(--text-muted)] leading-relaxed">
            We use essential cookies to maintain your shopping cart, secure authentication, and prevent bot fraud under the{" "}
            <strong className="text-[color:var(--text)]">DPDP Act 2023</strong>. Non-essential cookies help improve catalog recommendations.
          </p>

          {showCustomize && (
            <div className="mt-3 space-y-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 text-xs">
              <label className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium text-[color:var(--text)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Essential (Cart, Auth & Security)
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Always Active</span>
              </label>
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="font-medium text-[color:var(--text)]">Analytics & Performance</span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                />
              </label>
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="font-medium text-[color:var(--text)]">Personalized Recommendations</span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                />
              </label>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleAcceptAll}
              className="btn btn-sm bg-[color:var(--brand)] text-[color:var(--brand-fg)] font-semibold hover:brightness-110"
            >
              Accept All
            </button>
            <button
              onClick={handleEssentialOnly}
              className="btn btn-outline btn-sm"
            >
              Essential Only
            </button>
            {showCustomize ? (
              <button
                onClick={handleSaveCustom}
                className="btn btn-ghost btn-sm text-xs font-semibold"
              >
                Save Preferences
              </button>
            ) : (
              <button
                onClick={() => setShowCustomize(true)}
                className="btn btn-ghost btn-sm text-xs underline decoration-[color:var(--border)]"
              >
                Customize
              </button>
            )}
            <Link
              href="/privacy"
              className="ml-auto text-[11px] text-[color:var(--text-soft)] hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
