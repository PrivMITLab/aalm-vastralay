"use client";

import { useActionState, useState } from "react";
import { Check, MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/actions/account";
import SubmitButton from "@/components/SubmitButton";
import { INDIAN_STATES, cn } from "@/lib/utils";
import type { Address } from "@/db/schema";

const EMPTY = {
  id: "",
  label: "Home",
  fullName: "",
  phone: "",
  addressLine: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export default function AddressBook({ addresses }: { addresses: Address[] }) {
  const [state, action] = useActionState(saveAddress, null);
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openNew() {
    setErrors({});
    setEditing({ ...EMPTY, isDefault: addresses.length === 0 });
  }

  function validate(form: HTMLFormElement) {
    const data = new FormData(form);
    const errs: Record<string, string> = {};
    if (String(data.get("fullName") ?? "").trim().length < 2) errs.fullName = "Enter the recipient's name";
    if (!/^[6-9]\d{9}$/.test(String(data.get("phone") ?? "").trim())) errs.phone = "Enter a valid 10-digit mobile number";
    if (String(data.get("addressLine") ?? "").trim().length < 6) errs.addressLine = "Enter the full address (at least 6 characters)";
    if (String(data.get("city") ?? "").trim().length < 2) errs.city = "Enter the city";
    if (!String(data.get("state") ?? "")) errs.state = "Select your state";
    if (!/^\d{6}$/.test(String(data.get("pincode") ?? "").trim())) errs.pincode = "Enter a valid 6-digit pincode";
    setErrors(errs);
    if (Object.keys(errs).length) return false;
    return true;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[color:var(--brand)]">Saved addresses</h2>
        <button type="button" onClick={openNew} className="btn btn-outline btn-sm">
          <Plus className="h-4 w-4" /> Add address
        </button>
      </div>

      {state?.success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{state.success}</p>}
      {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{state.error}</p>}

      {addresses.length === 0 && !editing && (
        <p className="rounded-xl border border-dashed border-[color:var(--border-strong)] p-4 text-sm text-[color:var(--text-soft)]">
          No saved addresses yet. Add one for one-tap checkout.
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className={cn("rounded-2xl border p-4 text-sm", a.isDefault ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)]")}>
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-1.5 font-semibold">
                <MapPin className="h-4 w-4 text-[color:var(--brand)]" /> {a.label}
                {a.isDefault && (
                  <span className="badge bg-[color:var(--brand)] text-white">
                    <Star className="h-3 w-3 fill-white" /> Default
                  </span>
                )}
              </p>
            </div>
            <p className="mt-2">{a.fullName}</p>
            <p className="text-[color:var(--text-muted)]">
              {a.addressLine}
              {a.landmark ? `, ${a.landmark}` : ""}, {a.city}, {a.state} – {a.pincode}
            </p>
            <p className="text-[color:var(--text-muted)]">📞 {a.phone}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    id: a.id,
                    label: a.label,
                    fullName: a.fullName,
                    phone: a.phone,
                    addressLine: a.addressLine,
                    landmark: a.landmark ?? "",
                    city: a.city,
                    state: a.state,
                    pincode: a.pincode,
                    isDefault: a.isDefault,
                  })
                }
                className="btn btn-ghost btn-sm"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              {!a.isDefault && (
                <form action={setDefaultAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <SubmitButton variant="ghost" className="btn-sm" pendingText="…">
                    <Check className="h-3.5 w-3.5" /> Make default
                  </SubmitButton>
                </form>
              )}
              <form action={deleteAddress}>
                <input type="hidden" name="id" value={a.id} />
                <SubmitButton variant="ghost" className="btn-sm text-rose-700" pendingText="…">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <form
          action={(fd) => {
            const formEl = document.getElementById("address-form") as HTMLFormElement;
            if (!validate(formEl)) return;
            action(fd);
            setEditing(null);
          }}
          id="address-form"
          onSubmit={(e) => {
            if (!validate(e.currentTarget)) e.preventDefault();
          }}
          className="space-y-3 rounded-2xl border border-[color:var(--border)] p-4"
        >
          {editing.id && <input type="hidden" name="id" value={editing.id} />}
          <input type="hidden" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{editing.id ? "Edit address" : "New address"}</p>
            <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost btn-icon" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Label" name="label" defaultValue={editing.label} error={errors.label} placeholder="Home / Work / Parents" />
            <Field label="Full name" name="fullName" defaultValue={editing.fullName} error={errors.fullName} required />
            <Field label="Mobile" name="phone" defaultValue={editing.phone} error={errors.phone} required inputMode="numeric" maxLength={10} placeholder="10-digit number" />
            <Field label="Pincode" name="pincode" defaultValue={editing.pincode} error={errors.pincode} required inputMode="numeric" maxLength={6} />
            <div className="sm:col-span-2">
              <Field label="Address (house, street, area)" name="addressLine" defaultValue={editing.addressLine} error={errors.addressLine} required />
            </div>
            <Field label="Landmark (optional)" name="landmark" defaultValue={editing.landmark} />
            <Field label="City" name="city" defaultValue={editing.city} error={errors.city} required />
            <div>
              <label className="label" htmlFor="state">
                State
              </label>
              <select id="state" name="state" className="input" defaultValue={editing.state} required>
                <option value="" disabled>
                  Select state
                </option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-xs text-rose-600">{errors.state}</p>}
            </div>
          </div>
          <label className="flex w-fit items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" defaultChecked={editing.isDefault} className="h-4 w-4 accent-[color:var(--brand)]" /> Set as default
          </label>
          <SubmitButton pendingText="Saving…">{editing.id ? "Update address" : "Save address"}</SubmitButton>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  error,
  ...rest
}: { label: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} className="input" {...rest} />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
