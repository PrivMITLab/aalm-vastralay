"use client";

import React, { useState } from "react";
import { Mail, KeyRound, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { passwordScore } from "@/lib/format";

/**
 * 👑 AALM VASTRALAY — 2-STEP OTP PASSWORD RESET FORM
 *
 * Step 1: User enters email -> receives 6-digit OTP code in Gmail.
 * Step 2: User enters the 6-digit OTP received + New Password + Confirm Password.
 * Resets password seamlessly and redirects straight to login/dashboard.
 */
export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pwdScore = passwordScore(password);

  // --------------------------------------------------------------------------
  // STEP 1: Send OTP to User's Email
  // --------------------------------------------------------------------------
  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const { error } = await authClient.forgetPassword.emailOtp({
        email: cleanEmail,
      });

      if (error) {
        setErrorMessage(error.message || "OTP कोड नहीं भेजा जा सका। कृपया पुनः प्रयास करें।");
      } else {
        setSuccessMessage("6-अंकों का OTP कोड आपके ईमेल पर भेज दिया गया है। अपना इनबॉक्स चेक करें।");
        setStep("verify");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "अनुरोध पूरा नहीं हो सका (Network error).";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2: Verify 6-digit OTP & Set New Password
  // --------------------------------------------------------------------------
  const handleVerifyAndReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setErrorMessage("कृपया सही 6-अंकों का OTP दर्ज करें (Enter valid 6-digit OTP).");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password must be at least 6 characters).");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match).");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        password,
      });

      if (error) {
        setErrorMessage(error.message || "गलत या समाप्त हो चुका OTP। कृपया पुनः प्रयास करें।");
      } else {
        setSuccessMessage("पासवर्ड सफलतापूर्वक रीसेट हो गया है! अब आप लॉगिन कर सकते हैं।");
        setTimeout(() => {
          window.location.href = "/sign-in?reset=success";
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "त्रुटि हुई। कृपया पुनः प्रयास करें।";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP helper
  const handleResendOtp = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const { error } = await authClient.forgetPassword.emailOtp({
        email: email.trim().toLowerCase(),
      });
      if (error) {
        setErrorMessage(error.message || "नया OTP भेजने में असमर्थ।");
      } else {
        setSuccessMessage("नया 6-अंकों का OTP कोड फिर से भेज दिया गया है।");
      }
    } catch {
      setErrorMessage("OTP पुनः भेजने में त्रुटि हुई।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {errorMessage && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-800 dark:text-red-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {step === "request" ? (
        /* STEP 1: EMAIL INPUT FORM */
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              ईमेल पता (Registered Email)
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
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]/20 focus:border-[#7a1f2b] transition-all"
              />
            </div>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              हम आपके ईमेल पर 6-अंकों का गुप्त OTP भेजेंगे।
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#7a1f2b] hover:bg-[#601620] active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-md shadow-[#7a1f2b]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>OTP कोड भेज रहे हैं...</span>
              </>
            ) : (
              <>
                <span>OTP कोड प्राप्त करें (Get OTP)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* STEP 2: 6-DIGIT OTP + NEW PASSWORD FORM */
        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <span className="truncate">ईमेल: <strong>{email}</strong></span>
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setOtp("");
                setErrorMessage(null);
              }}
              className="text-[#7a1f2b] dark:text-amber-400 font-semibold hover:underline ml-2 shrink-0"
            >
              बदलें
            </button>
          </div>

          {/* 6-DIGIT OTP FIELD */}
          <div>
            <label htmlFor="otp-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              6-अंकों का OTP कोड (6-Digit OTP)
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="\d{6}"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="239977"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-base tracking-[0.35em] font-mono font-bold focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]/20 focus:border-[#7a1f2b] transition-all"
              />
            </div>
          </div>

          {/* NEW PASSWORD FIELD */}
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              नया पासवर्ड (New Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="new-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]/20 focus:border-[#7a1f2b] transition-all"
              />
            </div>
            {password.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="h-1 flex-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      pwdScore.score <= 1
                        ? "w-1/4 bg-red-500"
                        : pwdScore.score <= 3
                        ? "w-2/4 bg-amber-500"
                        : pwdScore.score <= 4
                        ? "w-3/4 bg-emerald-500"
                        : "w-full bg-emerald-600"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{pwdScore.label}</span>
              </div>
            )}
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              पासवर्ड की पुष्टि करें (Confirm Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]/20 focus:border-[#7a1f2b] transition-all"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#7a1f2b] hover:bg-[#601620] active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-md shadow-[#7a1f2b]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>पासवर्ड रीसेट हो रहा है...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>OTP सत्यापित करें और पासवर्ड बदलें</span>
              </>
            )}
          </button>

          {/* RESEND OTP BUTTON */}
          <div className="pt-2 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={handleResendOtp}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-[#7a1f2b] dark:hover:text-amber-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>OTP नहीं मिला? दोबारा भेजें (Resend OTP)</span>
            </button>
          </div>
        </form>
      )}

      {/* FOOTER LINK */}
      <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
        <a href="/sign-in" className="text-xs font-medium text-[#7a1f2b] hover:underline">
          ← साइन इन पर वापस जाएं (Back to Sign In)
        </a>
      </div>
    </div>
  );
}
