"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Sparkles, Mail, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";

/**
 * 👑 AALM VASTRALAY — MAGIC LINK FORM (1-CLICK PASSWORDLESS LOGIN)
 *
 * Interacts with Better Auth client to send a 1-click magic link.
 * Link expires in 5 minutes for maximum security.
 */
export default function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("कृपया एक वैध ईमेल पता दर्ज करें (Valid email required).");
      return;
    }

    setLoading(true);
    try {
      // Calls Better Auth magicLink sign-in plugin
      const { error } = await authClient.signIn.magicLink({
        email: cleanEmail,
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (error) {
        setErrorMessage(error.message || "मैजिक लिंक नहीं भेजा जा सका।");
      } else {
        setSent(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "त्रुटि हुई।";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-900/5">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-amber-50 rounded-full border border-amber-200/80 mb-2">
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">1-क्लिक पासवर्डलेस लॉगिन</h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          पासवर्ड याद रखने की कोई ज़रूरत नहीं! सीधे अपने ईमेल से लॉगिन करें।
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">मैजिक लिंक भेज दिया गया!</p>
              <p className="text-xs text-emerald-700 mt-1">
                हमने <strong className="font-mono">{email}</strong> पर एक सुरक्षित लॉगिन लिंक भेजा है।
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>यह लिंक सुरक्षा कारणों से केवल <strong>5 मिनट</strong> के लिए मान्य है।</span>
          </div>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="w-full py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all"
          >
            दूसरा ईमेल आज़माएं (Try another email)
          </button>
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="magic-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              ईमेल पता (Email Address)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="magic-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#7a1f2b] to-[#b8860b] hover:opacity-95 text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>लिंक भेज रहे हैं...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>मैजिक लिंक प्राप्त करें</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-stone-100 text-center">
        <a href="/sign-in" className="text-xs font-medium text-[#7a1f2b] hover:underline">
          पासवर्ड से लॉगिन करें (Login with Password)
        </a>
      </div>
    </div>
  );
}
