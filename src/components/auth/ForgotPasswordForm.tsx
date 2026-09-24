"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { requestPasswordReset, verifyOtpAndResetPassword } from "@/actions/auth";
import SubmitButton from "@/components/SubmitButton";
import BotShield from "@/components/security/BotShield";
import { cn } from "@/lib/utils";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [reqState, reqAction, reqPending] = useActionState(async (prev: unknown, fd: FormData) => {
    const res = await requestPasswordReset(null, fd);
    if (res?.success) {
      setStep("reset");
    }
    return res;
  }, null);

  const [resetState, resetAction, resetPending] = useActionState(verifyOtpAndResetPassword, null);

  return (
    <div className="space-y-6">
      {/* Step Indicator Tabs */}
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[color:var(--text-muted)]">
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 transition-all",
            step === "request"
              ? "bg-[color:var(--brand)] text-white shadow-xs"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          )}
        >
          {step === "reset" ? <CheckCircle2 className="h-3.5 w-3.5" /> : "1"}
          <span>1. OTP भेजें</span>
        </span>
        <span className="text-[color:var(--text-soft)]">→</span>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 transition-all",
            step === "reset"
              ? "bg-[color:var(--brand)] text-white shadow-xs"
              : "bg-[color:var(--surface-2)] text-[color:var(--text-soft)]",
          )}
        >
          2. नया पासवर्ड
        </span>
      </div>

      {step === "request" ? (
        /* STEP 1: Enter email to request 6-digit OTP */
        <form action={reqAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="reset-email">
              पंजीकृत ईमेल (Registered Email)
            </label>
            <div className="relative">
              <input
                id="reset-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-10"
              />
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[color:var(--text-soft)]" />
            </div>
            <p className="mt-1.5 text-xs text-[color:var(--text-soft)]">
              हम आपके ईमेल पर 6-अंकों का गुप्त OTP कोड भेजेंगे (15 मिनट के लिए मान्य)।
            </p>
          </div>

          <BotShield label="Security Check" />

          {reqState?.error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {reqState.error}
            </div>
          )}

          <SubmitButton className="btn btn-primary w-full py-2.5 text-sm font-bold shadow-md" pendingText="OTP भेजा जा रहा है…">
            6-अंकों का OTP प्राप्त करें →
          </SubmitButton>

          <div className="text-center pt-2">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand)] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> वापस साइन-इन पर जाएं (Back to Sign in)
            </Link>
          </div>
        </form>
      ) : (
        /* STEP 2: Enter 6-digit OTP and new password */
        <form action={resetAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <p className="font-semibold">✓ OTP आपके ईमेल पर भेज दिया गया है:</p>
            <p className="font-mono text-emerald-900 dark:text-emerald-200 truncate">{email}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label mb-0" htmlFor="reset-otp">
                6-अंकों का OTP (Enter OTP)
              </label>
              <button
                type="button"
                onClick={() => setStep("request")}
                className="text-xs font-semibold text-[color:var(--brand)] hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> ईमेल बदलें / Resend
              </button>
            </div>
            <div className="relative mt-1">
              <input
                id="reset-otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="input pl-10 text-center tracking-widest font-mono text-lg font-bold"
              />
              <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[color:var(--text-soft)]" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="new-password">
              नया पासवर्ड (New Password)
            </label>
            <div className="relative">
              <input
                id="new-password"
                name="password"
                type={showPass ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="कम से कम 6 अक्षर"
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-[color:var(--text-soft)]"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="confirm-password">
              पासवर्ड की पुष्टि करें (Confirm Password)
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showPass ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="पासवर्ड दोबारा दर्ज करें"
              className="input"
            />
          </div>

          <BotShield label="Security Check" />

          {resetState?.error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {resetState.error}
            </div>
          )}

          <SubmitButton className="btn btn-primary w-full py-2.5 text-sm font-bold shadow-md" pendingText="पासवर्ड बदला जा रहा है…">
            पासवर्ड रीसेट करें और लॉगिन करें →
          </SubmitButton>

          <div className="text-center pt-2">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand)] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> वापस साइन-इन पर जाएं
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
