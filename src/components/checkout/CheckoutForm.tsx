"use client";
import { preventDoubleSubmit } from "@/components/ui/Submit";
import { useActionState, useState, useTransition } from "react";
import { Banknote, CreditCard, Loader2, ShieldCheck, Smartphone, Tag } from "lucide-react";
import { placeOrder, validateCoupon } from "@/actions/orders";
import SubmitButton from "@/components/SubmitButton";
import ClickToSolve from "@/components/security/ClickToSolve";
import type { ShippingAddress } from "@/db/schema";
import { cn, formatINR } from "@/lib/utils";
import DynamicUpiQr from "./DynamicUpiQr";

type Props = {
  defaults: { fullName: string; phone: string };
  savedAddress: ShippingAddress | null;
  subtotal: number;
  shipping: number;
  codFee: number;
  returnWindowDays: number;
  states: string[];
  itemCount: number;
  savedAddresses: Array<{ id: string; label: string; fullName: string; phone: string; addressLine: string; landmark: string | null; city: string; state: string; pincode: string; isDefault: boolean }>;
};

const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: Banknote },
  { id: "upi", label: "UPI", desc: "GPay, PhonePe, Paytm & more", icon: Smartphone },
  { id: "online", label: "Card / Net banking", desc: "Debit, credit cards & banks", icon: CreditCard },
] as const;

export default function CheckoutForm({ defaults, savedAddress, subtotal, shipping, codFee, returnWindowDays, states, itemCount, savedAddresses }: Props) {
  const initialAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;
  const [chosen, setChosen] = useState<string | "new">(initialAddress?.id ?? "new");
  /** Click-to-solve gate: order button stays locked until PoW verified. */
  const [verified, setVerified] = useState(false);
  const [form, setForm] = useState({
    fullName: initialAddress?.fullName ?? savedAddress?.fullName ?? defaults.fullName,
    phone: initialAddress?.phone ?? savedAddress?.phone ?? defaults.phone,
    addressLine: initialAddress?.addressLine ?? savedAddress?.addressLine ?? "",
    landmark: initialAddress?.landmark ?? savedAddress?.landmark ?? "",
    pincode: initialAddress?.pincode ?? savedAddress?.pincode ?? "",
    city: initialAddress?.city ?? savedAddress?.city ?? "",
    state: initialAddress?.state ?? savedAddress?.state ?? "",
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  function pick(id: string) {
    const a = savedAddresses.find((x) => x.id === id);
    setChosen(id);
    if (a) {
      setForm({ fullName: a.fullName, phone: a.phone, addressLine: a.addressLine, landmark: a.landmark ?? "", pincode: a.pincode, city: a.city, state: a.state });
      setClientErrors({});
    }
  }
  function validateAddress() {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 2) e.fullName = "Enter recipient name";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile";
    if (form.addressLine.trim().length < 6) e.addressLine = "Enter the full address";
    if (form.city.trim().length < 2) e.city = "Enter city";
    if (!form.state) e.state = "Select state";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    setClientErrors(e);
    return Object.keys(e).length === 0;
  }
  const [state, action] = useActionState(placeOrder, null);
  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, startCheck] = useTransition();
  const [payment, setPayment] = useState<"cod" | "upi" | "online">("cod");

  const discount = applied?.discount ?? 0;
  const effectiveShipping = shipping + (payment === "cod" ? codFee : 0);
  const total = Math.max(0, subtotal + effectiveShipping - discount);

  function applyCoupon() {
    startCheck(async () => {
      const res = await validateCoupon(couponInput, subtotal);
      setCouponMsg({ ok: res.ok, text: res.message });
      setApplied(res.ok ? { code: res.code!, discount: res.discount } : null);
    });
  }

  return (
    <form onSubmit={(e) => { if (!validateAddress()) { e.preventDefault(); return; } preventDoubleSubmit(e); }} action={action} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="font-display text-lg font-semibold text-maroon-900">Delivery address</h2>

          {savedAddresses.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Choose a saved address</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {savedAddresses.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => pick(a.id)}
                    className={cn(
                      "rounded-2xl border p-3 text-left text-sm transition",
                      chosen === a.id ? "border-maroon-700 bg-maroon-50 ring-1 ring-maroon-300" : "border-cream-300 hover:border-maroon-400",
                    )}
                  >
                    <span className="flex items-center justify-between font-semibold">
                      {a.label} {a.isDefault && <span className="badge bg-maroon-700 text-white">Default</span>}
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">{a.fullName} · {a.phone}</span>
                    <span className="block text-xs text-slate-500">{a.addressLine}, {a.city}, {a.state} – {a.pincode}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setChosen("new"); }}
                  className={cn("rounded-2xl border border-dashed p-3 text-sm", chosen === "new" ? "border-maroon-700 text-maroon-800" : "border-cream-300 text-slate-600")}
                >
                  + Use a new address
                </button>
              </div>
            </div>
          )}

          <input type="hidden" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CField label="Full name" name="fullName" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} error={clientErrors.fullName} required autoComplete="name" />
            <CField label="Mobile number" name="phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} error={clientErrors.phone} required inputMode="numeric" maxLength={10} placeholder="10-digit mobile" autoComplete="tel" />
            <div className="sm:col-span-2">
              <CField label="Address (house no., building, street, area)" name="addressLine" value={form.addressLine} onChange={(v) => setForm({ ...form, addressLine: v })} error={clientErrors.addressLine} required autoComplete="street-address" />
            </div>
            <CField label="Landmark (optional)" name="landmark" value={form.landmark} onChange={(v) => setForm({ ...form, landmark: v })} />
            <CField label="Pincode" name="pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} error={clientErrors.pincode} required inputMode="numeric" maxLength={6} placeholder="6-digit pincode" autoComplete="postal-code" />
            <CField label="City" name="city" value={form.city} onChange={(v) => setForm({ ...form, city: v })} error={clientErrors.city} required autoComplete="address-level2" />
            <div>
              <label className="label" htmlFor="state">State</label>
              <select id="state" name="state" className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required>
                <option value="" disabled>Select state</option>
                {states.map((st) => (<option key={st} value={st}>{st}</option>))}
              </select>
              {clientErrors.state && <p className="mt-1 text-xs text-rose-600">{clientErrors.state}</p>}
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg font-semibold text-maroon-900">Payment method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PAYMENTS.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition",
                  payment === p.id ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] ring-2 ring-[color:var(--brand)]/20" : "border-[color:var(--border)] hover:border-[color:var(--brand)]/50",
                )}
              >
                <input type="radio" name="paymentMethod" value={p.id} checked={payment === p.id} onChange={() => setPayment(p.id)} className="sr-only" />
                <p.icon className="h-5 w-5 text-[color:var(--brand)]" />
                <span className="text-sm font-semibold text-[color:var(--text)]">{p.label}</span>
                <span className="text-xs text-[color:var(--text-muted)]">{p.desc}</span>
              </label>
            ))}
          </div>
          {payment === "upi" && (
            <DynamicUpiQr amount={total} orderReference="AV-PAY" />
          )}
          {payment === "online" && (
            <p className="mt-3 flex items-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              256-bit SSL encrypted. Payment details are handled securely via certified payment gateway.
            </p>
          )}
        </section>

        <section className="card p-5">
          <label className="label" htmlFor="notes">
            Order notes (optional)
          </label>
          <textarea id="notes" name="notes" className="input" placeholder="Blouse measurements, gift message, delivery instructions…" maxLength={500} />
        </section>
      </div>

      <aside className="card h-fit space-y-4 p-5 lg:sticky lg:top-40">
        <h2 className="font-display text-lg font-semibold text-maroon-900">Order summary</h2>

        <div>
          <label className="label" htmlFor="coupon">
            Coupon code
          </label>
          <div className="flex gap-2">
            <input
              id="coupon"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              className="input uppercase"
              placeholder="WELCOME10"
              disabled={Boolean(applied)}
            />
            {applied ? (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setApplied(null);
                  setCouponMsg(null);
                  setCouponInput("");
                }}
              >
                Remove
              </button>
            ) : (
              <button type="button" onClick={applyCoupon} disabled={checking || !couponInput} className="btn btn-gold btn-sm">
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />} Apply
              </button>
            )}
          </div>
          {couponMsg && <p className={cn("mt-1.5 text-xs font-medium", couponMsg.ok ? "text-emerald-700" : "text-rose-700")}>{couponMsg.text}</p>}
          <input type="hidden" name="couponCode" value={applied?.code ?? ""} />
          <p className="mt-2 text-[11px] text-slate-500">Try WELCOME10 (10% off), WEDDING500 (₹500 off ₹4,999+), FESTIVE15</p>
        </div>

        <dl className="space-y-2 border-t border-cream-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal ({itemCount} items)</dt>
            <dd>{formatINR(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Delivery</dt>
            <dd className={shipping === 0 ? "text-emerald-700" : ""}>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
          </div>
          {payment === "cod" && codFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-slate-600">COD handling fee</dt>
              <dd>{formatINR(codFee)}</dd>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Coupon ({applied?.code})</dt>
              <dd>-{formatINR(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold text-maroon-900">
            <dt>Total payable</dt>
            <dd>{formatINR(total)}</dd>
          </div>
        </dl>

        <ClickToSolve action="order" label="Main robot nahi hoon — order verify karo" onVerified={setVerified} />

        {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{state.error}</p>}

        <SubmitButton className="w-full" pendingText="Placing order…" disabled={!verified} lockHint="Pehle robot-check verify karo (Verify first)">
          {payment === "cod" ? "Place order (COD)" : `Pay ${formatINR(total)} & place order`}
        </SubmitButton>

        <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> 100% सुरक्षित ऑर्डर व सुरक्षित डिलीवरी
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            UPI, कार्ड या कैश ऑन डिलीवरी · {returnWindowDays} दिन में आसान वापसी
          </p>
        </div>

        <p className="text-center text-[11px] text-slate-500">By placing this order you agree to our {returnWindowDays}-day return policy. Orders are settled in INR.</p>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  ...rest
}: { label: string; name: string; defaultValue?: string | null } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} className="input" defaultValue={defaultValue ?? ""} {...rest} />
    </div>
  );
}

function CField({ label, name, error, onChange, ...rest }: { label: string; name: string; error?: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" onChange={(e) => onChange(e.target.value)} {...rest} />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
