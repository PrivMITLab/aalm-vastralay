"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";

/**
 * 👑 AALM VASTRALAY — FORGOT PASSWORD FORM (BETTER AUTH + TAILWIND CSS)
 *
 * Interacts with Better Auth client to send a password reset link or OTP.
 * Styled with luxury Indian ethnic aesthetic (Burgundy #7a1f2b & warm sand).
 */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("कृपया एक मान्य ईमेल दर्ज करें (Please enter a valid email address).");
      return;
    }

    setLoading(true);
    try {
      // Calls Better Auth password reset endpoint
      const { error } = await authClient.forgetPassword.emailOtp({
        email: cleanEmail,
      });

      if (error) {
        setErrorMessage(error.message || "अनुरोध पूरा नहीं हो सका। कृपया पुनः प्रयास करें।");
      } else {
        setSuccessMessage(
          "यदि यह ईमेल हमारे रिकॉर्ड में है, तो पासवर्ड रीसेट लिंक भेज दिया गया है। अपना इनबॉक्स चेक करें।"
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "अज्ञात त्रुटि हुई (Unexpected error).";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-900/5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-[#7a1f2b]">पासवर्ड भूल गए?</h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          अपना रजिस्टर्ड ईमेल दर्ज करें, हम आपको पासवर्ड रीसेट करने का लिंक भेजेंगे।
        </p>
      </div>

      {successMessage ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">लिंक भेज दिया गया है!</p>
            <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              ईमेल पता (Email Address)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]/20 focus:border-[#7a1f2b] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#7a1f2b] hover:bg-[#601620] active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-md shadow-[#7a1f2b]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>भेज रहे हैं...</span>
              </>
            ) : (
              <>
                <span>रीसेट लिंक भेजें</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-stone-100 text-center">
        <a href="/sign-in" className="text-xs font-medium text-[#7a1f2b] hover:underline">
          ← साइन इन पर वापस जाएं (Back to Sign In)
        </a>
      </div>
    </div>
  );
}
