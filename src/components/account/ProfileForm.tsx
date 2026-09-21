"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState } from "react";
import { updateProfile } from "@/actions/auth";
import SubmitButton from "@/components/SubmitButton";

export default function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action] = useActionState(updateProfile, null);
  return (
    <form onSubmit={preventDoubleSubmit} action={action} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="fullName">
          Full name
        </label>
        <input id="fullName" name="fullName" className="input" defaultValue={fullName} required />
      </div>
      <div>
        <label className="label" htmlFor="phone">
          Mobile number
        </label>
        <input id="phone" name="phone" className="input" defaultValue={phone} placeholder="98XXXXXXXX" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Email</label>
        <input className="input bg-cream-50" value={email} disabled />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        {state?.success && <span className="text-sm text-emerald-700">{state.success}</span>}
        {state?.error && <span className="text-sm text-rose-700">{state.error}</span>}
      </div>
    </form>
  );
}