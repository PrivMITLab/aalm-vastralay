"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { changePassword } from "@/actions/account";
import SubmitButton from "@/components/SubmitButton";
import { passwordScore } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SecurityForm() {
  const [state, action] = useActionState(changePassword, null);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const score = passwordScore(next);

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const errs: Record<string, string> = {};
    if (next.length < 8) errs.next = "Use at least 8 characters";
    else if (!/[a-z]/.test(next) || !/[A-Z]/.test(next) || !/\d/.test(next)) errs.next = "Mix upper case, lower case and a number";
    if (confirm !== next) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) e.preventDefault();
  }

  return (
    <form action={action} onSubmit={validate} className="space-y-3">
      <input type="hidden" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="flex items-center gap-2 text-sm font-semibold text-[color:var(--brand)]">
        <KeyRound className="h-4 w-4" /> Change password
      </p>
      <PwInput label="Current password" name="current" autoComplete="current-password" required />
      <div>
        <PwInput label="New password" name="next" autoComplete="new-password" required value={next} onChange={(e) => setNext(e.target.value)} show={show} setShow={setShow} />
        {next && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={cn("h-full flex-1 rounded-full", i < score.score ? (score.score >= 4 ? "bg-emerald-500" : score.score >= 2 ? "bg-amber-500" : "bg-rose-500") : "bg-[color:var(--surface-3)]")} />
              ))}
            </div>
            <span className="text-xs text-[color:var(--text-soft)]">{score.label}</span>
          </div>
        )}
        {errors.next && <p className="mt-1 text-xs text-rose-600">{errors.next}</p>}
      </div>
      <div>
        <PwInput label="Confirm new password" name="confirm" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} show={show} setShow={setShow} />
        {errors.confirm && <p className="mt-1 text-xs text-rose-600">{errors.confirm}</p>}
      </div>
      {state?.success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{state.success}</p>}
      {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{state.error}</p>}
      <SubmitButton pendingText="Updating…">Update password</SubmitButton>
      <p className="text-xs text-[color:var(--text-soft)]">Changing your password instantly signs out every other device.</p>
    </form>
  );
}

function PwInput({
  label,
  name,
  show,
  setShow,
  ...rest
}: { label: string; name: string; show?: boolean; setShow?: (v: boolean) => void } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [local, setLocal] = useState(false);
  const visible = setShow ? show : local;
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input id={name} name={name} type={visible ? "text" : "password"} className="input pr-10" {...rest} />
        <button type="button" onClick={() => (setShow ? setShow(!visible) : setLocal(!local))} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-[color:var(--text-soft)]" aria-label={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
