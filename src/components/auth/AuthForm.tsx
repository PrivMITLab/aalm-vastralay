"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn, signUp } from "@/actions/auth";
import SubmitButton from "@/components/SubmitButton";
import ClickToSolve from "@/components/security/ClickToSolve";
import { passwordScore } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AuthForm({ mode, redirectUrl, intent }: { mode: "sign-in" | "sign-up"; redirectUrl?: string; intent?: string }) {
  const [state, action] = useActionState(mode === "sign-in" ? signIn : signUp, null);
  const isSignUp = mode === "sign-up";
  const [form, setForm] = useState({ email: "", password: "", confirm: "", fullName: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [verified, setVerified] = useState(false);
  const score = passwordScore(form.password);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const errs: Record<string, string> = {};
    if (isSignUp && form.fullName.trim().length < 2) errs.fullName = "Please enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email)) errs.email = "Enter a valid email address";
    if (isSignUp && form.phone && !/^[6-9]\d{9}$/.test(form.phone)) errs.phone = "Enter a valid 10-digit Indian mobile number";
    if (form.password.length < (isSignUp ? 8 : 1)) errs.password = isSignUp ? "Use at least 8 characters" : "Enter your password";
    if (isSignUp && !/[a-z]/.test(form.password)) errs.password = "Add a lower-case letter";
    if (isSignUp && !/[A-Z]/.test(form.password)) errs.password = "Add an upper-case letter";
    if (isSignUp && !/\d/.test(form.password)) errs.password = "Add a number";
    if (isSignUp && form.confirm !== form.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) {
      e.preventDefault();
    }
  }

  const fieldCls = (k: string) => cn("input", errors[k] && "border-rose-500 ring-1 ring-rose-300");

  return (
    <form action={action} onSubmit={validate} className="space-y-4" noValidate>
      {redirectUrl && <input type="hidden" name="redirect_url" value={redirectUrl} />}
      {intent && <input type="hidden" name="intent" value={intent} />}
      {/* Honeypot – hidden from humans, bots fill it and get rejected */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />

      {isSignUp && (
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input id="fullName" name="fullName" className={fieldCls("fullName")} placeholder="Priya Sharma" required autoComplete="name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>}
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" className={fieldCls("email")} placeholder="you@example.com" required autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
      </div>
      {isSignUp && (
        <div>
          <label className="label" htmlFor="phone">
            Mobile number (optional)
          </label>
          <input id="phone" name="phone" type="tel" className={fieldCls("phone")} placeholder="98XXXXXXXX" autoComplete="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} />
          {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
        </div>
      )}
      <div>
        <div className="flex items-center justify-between">
          <label className="label mb-0" htmlFor="password">
            Password
          </label>
          {!isSignUp && (
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[color:var(--brand)] hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            className={cn(fieldCls("password"), "pr-10")}
            placeholder={isSignUp ? "At least 8 characters" : "Your password"}
            required
            minLength={isSignUp ? 8 : 1}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-[color:var(--text-soft)]" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {isSignUp && form.password && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={cn("h-full flex-1 rounded-full", i < score.score ? (score.score >= 4 ? "bg-emerald-500" : score.score >= 2 ? "bg-amber-500" : "bg-rose-500") : "bg-[color:var(--surface-3)]")} />
              ))}
            </div>
            <span className="text-xs text-[color:var(--text-soft)]">{score.label}</span>
          </div>
        )}
        {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
      </div>
      {isSignUp && (
        <div>
          <label className="label" htmlFor="confirm">
            Confirm password
          </label>
          <input id="confirm" type={show ? "text" : "password"} className={fieldCls("confirm")} required autoComplete="new-password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
          {errors.confirm && <p className="mt-1 text-xs text-rose-600">{errors.confirm}</p>}
        </div>
      )}

      <ClickToSolve action="auth" onVerified={setVerified} />

      {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{state.error}</p>}

      <SubmitButton
        className="w-full"
        pendingText={isSignUp ? "Creating account…" : "Signing in…"}
        disabled={!verified}
        lockHint="Pehle robot-check verify karo (Verify first)"
      >
        {isSignUp ? (intent === "seller" ? "Create seller account" : "Create account") : "Sign in"}
      </SubmitButton>

      <p className="text-center text-sm text-slate-600">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href={`/sign-in${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ""}`} className="font-semibold text-maroon-700 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Aalm Vastralay?{" "}
            <Link href={`/sign-up${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ""}`} className="font-semibold text-maroon-700 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
